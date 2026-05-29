app.post("/api/checkout", async (req, res) => {
  try {
    const store = await getStore(req);
    if (!store) {
      return res.status(401).json({ error: "Unauthorized store" });
    }

    const { items } = req.body;

    /* ─────────────────────────────
       VALIDATION
    ───────────────────────────── */
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          error: "Invalid cart items format",
        });
      }
    }

    /* ─────────────────────────────
       CREATE CHECKOUT SESSION
    ───────────────────────────── */
    const checkoutId = crypto.randomUUID();

    const { data: checkout, error } = await supabase
      .from("checkouts")
      .insert({
        id: checkoutId,
        store_id: store.id,
        items,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase checkout error:", error);
      return res.status(500).json({ error: "Failed to create checkout" });
    }

    /* ─────────────────────────────
       RESPONSE (SHOPIFY STYLE)
    ───────────────────────────── */
    return res.status(200).json({
      checkoutId: checkout.id,
      url: `${process.env.FRONTEND_URL}/checkout/${checkout.id}`,
    });

  } catch (err) {
    console.error("Checkout crash:", err);

    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});