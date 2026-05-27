import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const app = express();

/* ───────── MIDDLEWARE ───────── */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" }
  })
);

/* ───────── SUPABASE ───────── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ───────── INTENT + PRODUCT SIGNAL MODEL ───────── */
const intents = [
  {
    name: "buying",
    keywords: ["buy", "price", "cost", "order", "checkout"],
    reply: "I can show you the best-performing products right now.",
    score: 0.95
  },
  {
    name: "product_research",
    keywords: ["best", "recommend", "winning", "product", "trending"],
    reply: "Here are high-performing products from Meridian Market.",
    score: 0.9
  },
  {
    name: "automation",
    keywords: ["automation", "ai", "system", "bot"],
    reply: "Meridian Market uses AI to discover and test winning products automatically.",
    score: 0.85
  },
  {
    name: "dropshipping",
    keywords: ["dropship", "aliexpress", "supplier"],
    reply: "We source and test products from global suppliers in real time.",
    score: 0.8
  },
  {
    name: "support",
    keywords: ["help", "contact", "support"],
    reply: "Support is available via your dashboard inside Meridian Market.",
    score: 0.6
  }
];

/* ───────── INTENT DETECTOR ───────── */
function detectIntent(message = "") {
  const text = message.toLowerCase();

  let best = null;
  let bestScore = 0;

  for (const intent of intents) {
    const matches = intent.keywords.filter(k => text.includes(k)).length;

    if (matches > 0) {
      const score = matches * intent.score;

      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }
  }

  return best;
}

/* ───────── RESPONSE ENGINE ───────── */
function generateReply(intent) {
  if (!intent) {
    return {
      text: "Tell me what you're trying to sell or build — I can show you winning products instantly.",
      type: "fallback",
      confidence: 0.25
    };
  }

  return {
    text: intent.reply,
    type: intent.name,
    confidence: intent.score
  };
}

/* ───────── MERIDIAN LEAD + BUYING SCORE ───────── */
function scoreOpportunity(message, intent) {
  let score = 10;

  if (message.length > 50) score += 10;
  if (intent?.name === "buying") score += 30;
  if (intent?.name === "product_research") score += 25;
  if (intent?.name === "dropshipping") score += 20;
  if (message.includes("best")) score += 10;

  return Math.min(score, 100);
}

/* ───────── BOT / AI ENGINE ───────── */
app.post("/api/bot", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    const id = sessionId || crypto.randomUUID();

    const intent = detectIntent(message);
    const reply = generateReply(intent);
    const score = scoreOpportunity(message, intent);

    /* ───────── STORE CONVERSATION ───────── */
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_id", id)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("conversations").insert([
        {
          session_id: id,
          message,
          reply: reply.text,
          intent: reply.type,
          opportunity_score: score,
          confidence: reply.confidence,
          created_at: new Date().toISOString()
        }
      ]);
    }

    /* ───────── EVENT TRACKING (FOR AI LEARNING LOOP) ───────── */
    await supabase.from("events").insert([
      {
        type: "user_intent",
        intent: reply.type,
        score,
        created_at: new Date().toISOString()
      }
    ]);

    /* ───────── RESPONSE ───────── */
    return res.json({
      ...reply,
      opportunityScore: score,
      sessionId: id
    });

  } catch (err) {
    console.error("Meridian Engine Error:", err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/* ───────── HEALTH CHECK ───────── */
app.get("/", (req, res) => {
  res.json({
    status: "online",
    system: "Meridian Market AI Engine",
    mode: "autonomous commerce intelligence"
  });
});

/* ───────── START ───────── */
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Meridian Market AI Engine running on port ${port}`);
});