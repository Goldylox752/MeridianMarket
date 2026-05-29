import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/* ─────────────────────────────
   APP SETUP
───────────────────────────── */
const app = express();

/* IMPORTANT: webhook compatibility */
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

/* ─────────────────────────────
   SUPABASE
───────────────────────────── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ─────────────────────────────
   INTENTS
───────────────────────────── */
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
    reply: "Meridian Market uses AI to discover winning products.",
    score: 0.85
  },
  {
    name: "dropshipping",
    keywords: ["dropship", "aliexpress", "supplier"],
    reply: "We source and test products from global suppliers.",
    score: 0.8
  },
  {
    name: "support",
    keywords: ["help", "support", "contact"],
    reply: "Support is available inside your dashboard.",
    score: 0.6
  }
];

/* ─────────────────────────────
   INTENT ENGINE
───────────────────────────── */
function detectIntent(message = "") {
  const text = message.toLowerCase();

  let best = null;
  let bestScore = 0;

  for (const intent of intents) {
    const matches = intent.keywords.reduce(
      (acc, k) => acc + (text.includes(k) ? 1 : 0),
      0
    );

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

function generateReply(intent) {
  if (!intent) {
    return {
      text: "Tell me what you're trying to build — I can help instantly.",
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

function scoreOpportunity(message, intent) {
  let score = 10;

  if (message.length > 50) score += 10;
  if (message.includes("best")) score += 10;

  switch (intent?.name) {
    case "buying":
      score += 30;
      break;
    case "product_research":
      score += 25;
      break;
    case "dropshipping":
      score += 20;
      break;
  }

  return Math.min(score, 100);
}

/* ─────────────────────────────
   BOT ENDPOINT
───────────────────────────── */
app.post("/api/bot", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Invalid message" });
    }

    const id = sessionId || crypto.randomUUID();

    const intent = detectIntent(message);
    const reply = generateReply(intent);
    const score = scoreOpportunity(message, intent);

    /* save conversation (first message only) */
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_id", id)
      .limit(1);

    if (!existing?.length) {
      await supabase.from("conversations").insert({
        session_id: id,
        message,
        reply: reply.text,
        intent: reply.type,
        opportunity_score: score,
        confidence: reply.confidence,
        created_at: new Date().toISOString()
      });
    }

    /* enqueue event */
    await supabase.from("event_queue").insert({
      type: "user_intent",
      status: "pending",
      attempts: 0,
      run_after: new Date().toISOString(),
      payload: {
        sessionId: id,
        message,
        intent: reply.type,
        score
      }
    });

    return res.json({
      ...reply,
      opportunityScore: score,
      sessionId: id
    });

  } catch (err) {
    console.error("BOT ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ─────────────────────────────
   EVENT WORKER (SAFE VERSION)
───────────────────────────── */

let workerRunning = false;

/* atomic job claim (NO DUPLICATES) */
async function fetchAndClaimJobs() {
  const { data } = await supabase
    .from("event_queue")
    .update({ status: "processing" })
    .eq("status", "pending")
    .lte("run_after", new Date().toISOString())
    .select("*")
    .limit(10);

  return data || [];
}

/* event handler */
async function handleEvent(event) {
  const payload = event.payload;

  switch (event.type) {
    case "user_intent": {
      await supabase.from("events").insert({
        type: "processed_intent",
        intent: payload.intent,
        score: payload.score,
        created_at: new Date().toISOString()
      });
      return;
    }

    default:
      return;
  }
}

/* main worker loop */
async function processEventQueue() {
  const jobs = await fetchAndClaimJobs();

  if (!jobs.length) return;

  for (const job of jobs) {
    try {
      await handleEvent(job);

      await supabase
        .from("event_queue")
        .update({
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

    } catch (err) {
      await supabase
        .from("event_queue")
        .update({
          status:
            (job.attempts || 0) + 1 >= 5 ? "failed" : "pending",
          attempts: (job.attempts || 0) + 1,
          last_error: err.message,
          run_after: new Date(Date.now() + 30000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

      console.error("WORKER ERROR:", err.message);
    }
  }
}

/* safe interval (no overlap) */
setInterval(async () => {
  if (workerRunning) return;

  workerRunning = true;

  try {
    await processEventQueue();
  } catch (err) {
    console.error("Worker crash:", err);
  }

  workerRunning = false;
}, 5000);

/* ─────────────────────────────
   HEALTH CHECK
───────────────────────────── */
app.get("/", (req, res) => {
  res.json({
    status: "online",
    system: "Meridian Market Engine",
    mode: "queue-driven backend (MVP production)"
  });
});

/* ─────────────────────────────
   START SERVER
───────────────────────────── */
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});