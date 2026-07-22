import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { chartFacts, PROFILE } from "../src/lib/data";

/**
 * "Frag dein Horoskop" proxy. Keeps the Anthropic key server-side (never
 * shipped to the client) and grounds every answer in the user's actual
 * chart. Set ANTHROPIC_API_KEY in the Vercel project (see DEPLOY.md).
 *
 * Model is configurable via ANTHROPIC_MODEL; defaults to Sonnet 4.6 for a
 * snappy, low-latency reply.
 */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const SYSTEM = `Du bist Vela, ein warmer, kluger astrologischer Begleiter.
Antworte auf Deutsch, in Klartext (KEINE Fachbegriffe ohne Erklärung), persönlich und konkret.
Beziehe dich auf das echte Geburtsbild der Person. Halte dich kurz (2–4 Sätze), poetisch aber bodenständig.
Versprich keine Zukunft und gib keine medizinischen, rechtlichen oder finanziellen Ratschläge.

Geburtsbild von ${PROFILE.name} (${PROFILE.birth}):
${chartFacts()}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY ist nicht gesetzt." });
    return;
  }

  const question = (req.body?.question ?? "").toString().slice(0, 500).trim();
  if (!question) {
    res.status(400).json({ error: "Keine Frage übergeben." });
    return;
  }

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: "user", content: question }],
    });
    const answer = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    res.status(200).json({ answer });
  } catch (err) {
    console.error("ask error", err);
    res.status(500).json({ error: "Anfrage fehlgeschlagen." });
  }
}
