app.post("/api/checkout", async (req, res) => {
  const store = await getStore(req);
  if (!store) return res.status(401).json({ error: "Unauthorized store" });

  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Empty cart" });
  }

  const checkoutId = crypto.randomUUID();

  // DO NOT reserve stock yet (Shopify rule)
  const { data } = await supabase
    .from("checkouts")
    .insert({
      id: checkoutId,
      store_id: store.id,
      items,
      status: "pending"
    })
    .select()
    .single();

  res.json({
    checkoutId: data.id,
    url: `${process.env.FRONTEND_URL}/checkout/${checkoutId}`
  });
});