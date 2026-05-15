import { findRelevant, toCSV, buildInsightContext } from "../data/productHelpers";

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || "llama-3.3-70b-versatile";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_INSTRUCTION = `You are Bravo Assistant, an in-store AI shopping helper for Bravo, an Azerbaijani supermarket chain.

You receive the user question PLUS a CSV slice of products the system thinks might be relevant. The CSV may contain irrelevant items — you must filter them yourself.

HARD RULES (do not break):
1. Answer in the same language the user wrote (Azerbaijani or English).
2. Be concise — 1–3 short sentences.
3. SEMANTIC RELEVANCE: never recommend an item whose category/name doesn't actually match the user's intent.
   • If they ask for snacks (qəlyanaltı), only suggest items from Snacks / Biscuits / Chips / Nuts / Chocolate. NEVER recommend shampoo, oil, mustard, baby products, etc.
   • If they ask for drinks (içki), only Beverages.
   • If they ask for halal / vegan / diet, only items plausibly matching.
4. PRICE: if the user named a price ceiling (e.g. "5 AZN altı", "under 5 AZN"), every item you suggest MUST be at or below that price. Re-read each candidate's price column before suggesting it.
5. If nothing in the provided CSV truly matches, say so honestly — do NOT recommend off-topic products to fill space. Example: "Təəssüf, 5 AZN altında uyğun qəlyanaltı tapa bilmədim."
6. Format each suggestion as: <Product Name> — <price> ₼ (<aisle/location>). Maximum 3 suggestions.

Match the user's tone. Never invent products or prices not in the CSV.`;

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

const ADMIN_SYSTEM = `You are a senior retail inventory analyst speaking directly to the store manager at a Bravo supermarket. You receive a structured snapshot of stock levels, 30-day sales velocity, and expiry status for the most flagged SKUs.

Write a short, conversational store-manager briefing — 3 short paragraphs, no bullets, no markdown, no headers. Speak in the second person ("you should…"). Name specific products and brands. Quote concrete numbers (units, days, % discount, reorder qty) and reasoning. Lead with the most urgent items.

Structure:
1. Opening paragraph: what needs action TODAY (expiring items + their suggested markdowns).
2. Middle paragraph: what to reorder this week (low stock + suggested quantities).
3. Closing paragraph: slow-movers — name 2–3 overstocked items and suggest specific markdowns to clear them.

Each paragraph must be 2–3 sentences max. Total reply ≤ 130 words. Never invent numbers — only use what's in the snapshot. Match the manager's professional tone, not casual.`;

export async function getInsights() {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }
  const context = buildInsightContext();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: ADMIN_SYSTEM },
        { role: "user", content: context },
      ],
      temperature: 0.3,
      max_tokens: 700,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `AI error (${res.status})`;
    throw new Error(msg);
  }
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "Could not generate insights."
  );
}
