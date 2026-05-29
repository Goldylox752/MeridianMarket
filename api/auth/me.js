import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const permissions = {
  basic: ["tools"],
  pro: ["tools", "leads", "roof_flow"],
  enterprise: ["tools", "leads", "roof_flow", "marketplace", "admin"]
};

export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.json({ access: false });
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.json({ access: false });
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (error || !subscription?.plan) {
      return res.json({ access: false });
    }

    const plan = subscription.plan;

    return res.json({
      access: true,
      plan,
      modules: permissions[plan] || []
    });

  } catch (err) {
    console.error("Access check error:", err);
    return res.status(500).json({ access: false });
  }
}