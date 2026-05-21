import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ========== LOAD ENV VARS ==========
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const EVAN_NUMBER = Deno.env.get('EVAN_WHATSAPP_NUMBER');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
const PRODUCT_SKU = 'SKY-X1'; // your product SKU

const requiredEnv = [
  'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'EVAN_WHATSAPP_NUMBER',
  'RESEND_API_KEY', 'ADMIN_EMAIL'
];
const missing = requiredEnv.filter(k => !Deno.env.get(k));
if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);

const stripe = Stripe(STRIPE_SECRET_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========== WHATSAPP ==========
async function sendWhatsApp(to, body) {
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body } })
  });
  if (!res.ok) console.error('WhatsApp failed:', await res.text());
}

// ========== EMAIL via Resend ==========
async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Skymaster <orders@yourdomain.com>', to, subject, html })
  });
  if (!res.ok) console.error('Email failed:', await res.text());
}

// ========== DECREMENT STOCK ==========
async function decrementStock(productId, quantity = 1) {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock, low_stock_threshold, name')
    .eq('sku', PRODUCT_SKU)
    .single();
  if (fetchError) throw fetchError;
  if (product.stock < quantity) throw new Error('Insufficient stock');

  const { error: updateError } = await supabase
    .from('products')
    .update({ stock: product.stock - quantity })
    .eq('sku', PRODUCT_SKU);
  if (updateError) throw updateError;

  // Low stock alert (optional: send to Evan or admin)
  const newStock = product.stock - quantity;
  if (newStock <= product.low_stock_threshold) {
    await sendWhatsApp(EVAN_NUMBER, `⚠️ Low stock alert: ${product.name} has only ${newStock} left.`);
  }
  return newStock;
}

// ========== WEBHOOK HANDLER ==========
serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('test') === 'true') {
    await sendWhatsApp(EVAN_NUMBER, 'Test: WhatsApp works.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`💰 Payment for session ${session.id}`);

    // Get product ID from SKU
    const { data: product } = await supabase.from('products').select('id').eq('sku', PRODUCT_SKU).single();
    if (!product) throw new Error('Product not found');

    // 1. Decrement stock
    const newStock = await decrementStock(product.id);
    console.log(`Stock updated: now ${newStock}`);

    // 2. Insert order with product_id
    const addr = session.shipping_details?.address;
    const addressStr = addr ? `${addr.line1}, ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country}` : 'No address provided';
    await supabase.from('orders').insert({
      stripe_session_id: session.id,
      product_id: product.id,
      customer_name: session.shipping_details?.name || session.customer_details?.name,
      customer_email: session.customer_details?.email,
      customer_address: addressStr,
      amount_total: session.amount_total,
      status: 'paid'
    });

    // 3. Send WhatsApp to Evan
    const amountDollars = (session.amount_total / 100).toFixed(2);
    await sendWhatsApp(EVAN_NUMBER, 
      `🛸 NEW DRONE ORDER 🛸\nCustomer: ${session.shipping_details?.name}\nEmail: ${session.customer_details?.email}\nAddress: ${addressStr}\nAmount: $${amountDollars}\nStock left: ${newStock}\n📦 Please fulfill.`);

    // 4. Send email confirmation to customer
    const emailHtml = `
      <h2>Thank you for your order, ${session.shipping_details?.name || 'Customer'}!</h2>
      <p>Your Skymaster X1 Pro drone will be shipped within 2 business days.</p>
      <p><strong>Order summary:</strong><br>
      Item: Skymaster X1 Pro Drone<br>
      Amount: $${amountDollars}<br>
      Shipping to: ${addressStr}</p>
      <p>Track your order via the link we'll send once shipped.</p>
      <p>Questions? Reply to this email or WhatsApp us.</p>
    `;
    await sendEmail(session.customer_details?.email, 'Your Skymaster X1 order confirmation', emailHtml);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});