import express from "express";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

/* =========================
   CORE CONFIG
========================= */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* Hidden internal contacts (NEVER exposed to frontend) */
const OWNER_WHATSAPP = "17802679673";
const SUPPLIER_WHATSAPP = "8617370511617";
const OWNER_EMAIL = "byronsanche@zohomailcloud.ca";

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* Stripe webhook needs raw body */
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  /* =========================
     PAYMENT SUCCESS HANDLER
  ========================= */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const order = {
      email: session.customer_details?.email || "unknown",
      amount: session.amount_total || 0,
      status: "paid",
      created_at: new Date().toISOString()
    };

    try {
      /* 1. Save order */
      await supabase.from("orders").insert([order]);

      /* 2. Email confirmation */
      await sendEmail(order);

      /* 3. WhatsApp alert to owner */
      await sendWhatsApp(
        OWNER_WHATSAPP,
        `🚁 NEW ORDER PAID\n\nEmail: ${order.email}\nAmount: $${order.amount / 100}`
      );

      /* 4. WhatsApp alert to supplier */
      await sendWhatsApp(
        SUPPLIER_WHATSAPP,
        `📦 NEW DRONE ORDER\n\nShip Skymaster X1 ASAP\nCustomer: ${order.email}`
      );

      console.log("✅ Order processed successfully");
    } catch (err) {
      console.error("Order processing error:", err.message);
    }
  }

  res.json({ received: true });
});

/* =========================
   CREATE STRIPE CHECKOUT
========================= */
app.post("/create-checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Skymaster X1 Drone",
              description: "4K Roof Inspection Drone"
            },
            unit_amount: 89900
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL}/?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/?cancel=true`
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err.message);
    return res.status(500).json({ error: "Checkout failed" });
  }
});

/* =========================
   EMAIL (ZOHO SMTP)
========================= */
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: OWNER_EMAIL,
    pass: process.env.ZOHO_PASSWORD
  }
});

async function sendEmail(order) {
  await transporter.sendMail({
    from: `RoofFlow Orders <${OWNER_EMAIL}>`,
    to: OWNER_EMAIL,
    subject: "🚁 New Drone Order Paid",
    text: `
NEW ORDER RECEIVED

Email: ${order.email}
Amount: $${order.amount / 100}
Status: ${order.status}
    `
  });
}

/* =========================
   WHATSAPP ALERT (CLICK-TO-CHAT)
========================= */
async function sendWhatsApp(phone, message) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  await axios.get(url);
}

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Skymaster Checkout System",
    version: "3.0"
  });
});

/* =========================
   START SERVER
========================= */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});