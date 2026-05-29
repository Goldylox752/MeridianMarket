import express from "express";

export function stripeWebhook({ stripe, supabase }) {
  const router = express.Router();

  // IMPORTANT: raw body must be used ONLY here
  router.post(
    "/stripe-webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      let event;

      // =========================
      // VERIFY STRIPE SIGNATURE
      // =========================
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers["stripe-signature"],
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("❌ Webhook signature failed:", err.message);
        return res.status(400).send("Invalid signature");
      }

      try {
        // =========================
        // HANDLE EVENT ROUTING
        // =========================
        switch (event.type) {
          // =========================
          // CHECKOUT COMPLETED
          // =========================
          case "checkout.session.completed": {
            const session = event.data.object;
            const metadata = session.metadata || {};
            const sku = metadata.sku;
            const order_id = metadata.order_id;

            if (!sku) {
              console.error("❌ Missing SKU in metadata");
              return res.status(200).json({ received: true });
            }

            // =========================
            // IDEMPOTENCY CHECK
            // =========================
            const { data: existingOrder, error: fetchError } = await supabase
              .from("orders")
              .select("id, status")
              .eq("stripe_session_id", session.id)
              .maybeSingle();

            if (fetchError) {
              console.error("❌ Order lookup error:", fetchError);
              return res.status(500).json({ error: "DB error" });
            }

            if (existingOrder?.status === "paid") {
              console.log("⚠️ Already processed:", session.id);
              return res.status(200).json({ received: true });
            }

            // =========================
            // GET PRODUCT
            // =========================
            const { data: product, error: productError } = await supabase
              .from("products")
              .select("id, sku, name, stock, price")
              .eq("sku", sku)
              .single();

            if (productError || !product) {
              console.error("❌ Product not found:", sku);
              return res.status(200).json({ received: true });
            }

            if (product.stock <= 0) {
              console.error("❌ Out of stock:", sku);
              return res.status(200).json({ received: true });
            }

            // =========================
            // DECREMENT STOCK (ATOMIC RPC)
            // =========================
            const { error: stockError } = await supabase.rpc(
              "decrement_stock",
              { sku_input: sku }
            );

            if (stockError) {
              console.error("❌ Stock update failed:", stockError);
              return res.status(500).json({ error: "Stock error" });
            }

            // =========================
            // UPSERT ORDER
            // =========================
            const { error: orderError } = await supabase
              .from("orders")
              .upsert(
                {
                  stripe_session_id: session.id,
                  order_id: order_id || null,
                  sku,
                  product_name: product.name,
                  amount_total: session.amount_total,
                  currency: session.currency,
                  status: "paid",
                  customer_email: session.customer_details?.email || null,
                  customer_name: session.customer_details?.name || null,
                  payment_status: session.payment_status,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                { onConflict: "stripe_session_id" }
              );

            if (orderError) {
              console.error("❌ Order save failed:", orderError);
              return res.status(500).json({ error: "Order error" });
            }

            // =========================
            // OPTIONAL: FULFILLMENT HOOK
            // (Do NOT block webhook)
            // =========================
            triggerFulfillment({
              sku,
              session,
              customer_email: session.customer_details?.email || null
            });

            console.log("✅ Order processed:", session.id);
            break;
          }

          // =========================
          // CHECKOUT EXPIRED
          // =========================
          case "checkout.session.expired": {
            console.log("⚠️ Checkout expired:", event.data.object.id);
            break;
          }

          // =========================
          // PAYMENT FAILED
          // =========================
          case "payment_intent.payment_failed": {
            console.error(
              "❌ Payment failed:",
              event.data.object.id
            );
            break;
          }

          default:
            console.log("ℹ️ Unhandled event:", event.type);
        }

        return res.status(200).json({ received: true });
      } catch (err) {
        console.error("❌ Webhook crash:", err);
        return res.status(500).json({ error: "Webhook failed" });
      }
    }
  );

  return router;
}

// =========================
// SAFE FULFILLMENT HOOK
// (non-blocking, prevents Stripe timeout issues)
// =========================
function triggerFulfillment(data) {
  setImmediate(async () => {
    try {
      await fetch(`${process.env.BASE_URL}/api/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error("❌ Fulfillment failed:", err.message);
    }
  });
}