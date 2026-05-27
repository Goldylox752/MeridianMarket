app.post("/create-checkout", async (req, res) => {
  try {
    const { sku } = req.body;

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("sku", sku)
      .single();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ error: "Out of stock" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description
            },
            unit_amount: Math.round(product.price * 100)
          },
          quantity: 1
        }
      ],

      metadata: {
        sku: product.sku
      },

      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});