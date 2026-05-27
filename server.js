app.post("/create-checkout", async (req, res) => {
  try {
    const { sku } = req.body;

    /* ─────────────────────────
       VALIDATION
    ───────────────────────── */
    if (!sku) {
      return res.status(400).json({
        error: "SKU is required"
      });
    }

    /* ─────────────────────────
       FETCH PRODUCT
    ───────────────────────── */
    const { data: product, error } = await supabase
      .from("products")
      .select("sku, name, description, price, stock, active")
      .eq("sku", sku)
      .single();

    if (error || !product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    /* ─────────────────────────
       STOCK CHECK
    ───────────────────────── */
    if (!product.active) {
      return res.status(400).json({
        error: "Product is not available"
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        error: "Out of stock"
      });
    }

    /* ─────────────────────────
       CREATE STRIPE SESSION
    ───────────────────────── */
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description || ""
            },
            unit_amount: Math.round(product.price * 100)
          },
          quantity: 1
        }
      ],

      metadata: {
        sku: product.sku
      },

      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });

    /* ─────────────────────────
       RESPONSE
    ───────────────────────── */
    return res.json({
      url: session.url
    });

  } catch (err) {
    console.error("Checkout error:", err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
});