import { findRelevant, toCSV } from "../data/productHelpers";

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || "llama-3.3-70b-versatile";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_INSTRUCTION = `You are Bravo Assistant, an in-store AI shopping helper for Bravo, an Azerbaijani supermarket chain.

Your job is to help shoppers find products, compare prices, check availability, and get recommendations. You have access to a subset of the live product catalog that is most relevant to each user query (provided as CSV in each user message).

Rules:
- Answer in the same language the user wrote in (English or Azerbaijani). Match their tone.
- Be concise. 1–3 short sentences for chat answers.
- When recommending products, name 2–4 specific items from the provided catalog with their price (in AZN, written as e.g. "2.45 ₼") and aisle/category if useful.
- If the user asks about a price range (e.g. "under 5 AZN"), only suggest items that fit.
- If nothing in the provided catalog matches, say so honestly and suggest an alternative search.
- Never invent products or prices that are not in the provided catalog.`;

export async function askAI({ message, history = [] }) {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }

  const relevant = findRelevant(message, 30);
  const catalogCsv = toCSV(relevant);

  const userTurnText = `User question: ${message}

Relevant catalog rows (CSV):
${catalogCsv}`;

  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    ...history.map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: userTurnText },
  ];

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 512,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `AI error (${res.status})`;
    throw new Error(msg);
  }
  const text = data?.choices?.[0]?.message?.content?.trim() ||
    "Sorry, I couldn't generate a response.";
  return { text, relevant };
}
