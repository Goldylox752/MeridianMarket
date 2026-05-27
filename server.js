import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================
   CREATE CHECKOUT SESSION
========================= */
app.post("/create-checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Skymaster X1 Drone"
          },
          unit_amount: 89900
        },
        quantity: 1
      }
    ],
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`
  });

  res.json({ url: session.url });
});

/* =========================
   STRIPE WEBHOOK
========================= */
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email = session.customer_details?.email;

      /* 1. STORE ORDER */
      await supabase.from("orders").insert([
        {
          stripe_session: session.id,
          email,
          amount: session.amount_total,
          status: "paid"
        }
      ]);

      /* 2. REDUCE STOCK */
      await supabase.rpc("decrease_stock", {
        sku_input: "SKY-X1"
      });

      /* 3. EMAIL OWNER */
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "RoofFlow <orders@roofflow.ai>",
          to: "byronsanche@zohomailcloud.ca",
          subject: "New Drone Order",
          html: `New order received: ${email}`
        })
      });

      /* 4. SUPPLIER WHATSAPP */
      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${process.env.SUPPLIER_WA}&text=NEW%20ORDER%20Skymaster%20X1&apikey=${process.env.WA_KEY}`
      );
    }

    res.json({ received: true });
  }
);

/* =========================
   STOCK API
========================= */
app.get("/stock/:sku", async (req, res) => {
  const { data } = await supabase
    .from("products")
    .select("stock")
    .eq("sku", req.params.sku)
    .single();

  res.json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running"));