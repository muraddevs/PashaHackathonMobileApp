import {
  findRelevant,
  findCold,
  toCSV,
  buildInsightContext,
} from "../data/productHelpers";

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || "llama-3.3-70b-versatile";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_INSTRUCTION_BASE = `You are Bravo Assistant — a warm, helpful in-store concierge for Bravo, an Azerbaijani supermarket chain. Shoppers chat with you for product help, recipes, prices, dietary advice, and casual questions.

LANGUAGE — this is the most important rule:
- Reply in the SAME language as the user's MOST RECENT message, even if previous turns were in a different language. Switch immediately when they switch.
- English → English. Azerbaijani → reply with proper ə, ş, ğ, ı, ü, ö, ç. Russian → reply in Russian.
- "salam", "necə", "təşəkkür" → Azerbaijani. "hi/hello/thanks" → English. "привет/спасибо" → Russian.
- Never mix two languages in the same reply.

WHAT TO REPLY:
1. GREETING / SMALL TALK (salam, hi, привет, "how are you", "thanks", "ok"):
   Just reply warmly and conversationally — DO NOT mention products or say "nothing matches". One short sentence.
   • AZ: "Salam! Sizə necə kömək edə bilərəm?"
   • EN: "Hi! How can I help you in-store today?"
   • RU: "Привет! Чем могу помочь?"
2. GENERAL QUESTION not about products (store hours, location, "what is X"):
   Answer briefly and helpfully. Don't force products into the response.
3. PRODUCT QUESTION (looking for items, prices, recipes, dietary advice):
   Use the provided catalog CSV. Filter for semantic relevance — e.g. snacks/qəlyanaltı/снеки means only Snacks / Biscuits / Chips / Nuts / Chocolate, never shampoo or oil.
   If they named a price ceiling ("5 AZN altı", "under 5 AZN", "до 5 AZN"), every suggestion MUST be at or below that price.
   Format each suggestion as: Product Name — price ₼ (Aisle X).
   Maximum 3 suggestions.
   If genuinely nothing matches, say so in the user's language ("Təəssüf, uyğun tapa bilmədim." / "Sorry, nothing matches." / "К сожалению, ничего не нашлось.") — only for product queries, never for greetings.

TONE: 1–3 short sentences. Warm but efficient. Match the user's tone — informal if they're informal.

Never invent products or prices not in the CSV.`;

// Tri-lingual detection. Bravo is in Azerbaijan, so we lean toward AZ when
// a message is ambiguous (e.g. single Latin word like "salam").
const AZ_WORDS = new Set([
  "salam", "salaməleyküm", "salameleyküm", "salameleykum",
  "necə", "nece", "necesən", "necesen",
  "sağ", "sag", "olun", "ol",
  "təşəkkür", "teshekkur", "teshekkurler", "təşəkkürlər",
  "altı", "alti", "üstü", "ustu",
  "ucuz", "baha",
  "manat", "azn",
  "süd", "sud", "ət", "et", "toyuq", "çörək", "corek",
  "qəlyanaltı", "qelyanaltı", "qelyanalti",
  "məhsul", "mehsul", "qiymət", "qiymet",
  "harada", "harda", "var", "yox", "var?",
  "axtarıram", "axtariram", "tapmaq",
  "olar", "olmaz", "bəli", "beli", "xeyr",
  "yemək", "yemek", "hazırla", "hazirla", "bişir", "bisir",
  "süpermarket", "supermarket", "bravo",
  "hörmətli", "hormetli",
  "günaydın", "gunaydin", "axşam", "axsham", "axsam",
]);
const EN_WORDS = new Set([
  "hi", "hello", "hey", "thanks", "thank", "ok", "yes", "no", "please",
  "good", "morning", "evening", "afternoon", "bye", "what", "where", "when",
  "how", "do", "you", "have", "i", "want", "make", "cook", "need", "find",
  "show", "tell", "the", "and", "for", "with", "on", "in", "at",
]);

function detectLanguage(text) {
  if (!text) return "Azerbaijani";
  const t = text.trim();
  // Cyrillic → Russian (strong signal)
  if (/[Ѐ-ӿ]/.test(t)) return "Russian";
  // AZ-specific characters → Azerbaijani (strong signal)
  if (/[əƏşŞğĞıİöÖüÜçÇ]/.test(t)) return "Azerbaijani";
  // Otherwise score by known word lists; tie-break toward AZ since the
  // user base is overwhelmingly AZ-speaking.
  const tokens = t.toLowerCase().replace(/[^\p{L}\s]/gu, " ").split(/\s+/).filter(Boolean);
  let az = 0, en = 0;
  for (const tok of tokens) {
    if (AZ_WORDS.has(tok)) az++;
    if (EN_WORDS.has(tok)) en++;
  }
  if (az > en) return "Azerbaijani";
  if (en > az) return "English";
  // Tie or no signal — default to Azerbaijani (Bravo is in Azerbaijan).
  return "Azerbaijani";
}

export async function askAI({ message, history = [] }) {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }

  const relevant = findRelevant(message, 30);
  const catalogCsv = toCSV(relevant);
  const lang = detectLanguage(message);

  const systemContent = `${SYSTEM_INSTRUCTION_BASE}

The user's CURRENT message is detected as ${lang}. Reply STRICTLY in ${lang}, even if previous messages were in another language. The conversation history might be in mixed languages — ignore that and follow the CURRENT message's language. Do not mix languages in your reply.`;

  const userTurnText = `User question: ${message}

Relevant catalog rows (CSV):
${catalogCsv}`;

  // Keep only the last 4 turns of history so the conversation context
  // doesn't anchor the model into a prior language.
  const trimmedHistory = history.slice(-4);
  const messages = [
    { role: "system", content: systemContent },
    ...trimmedHistory.map((m) => ({
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

  // Parse "<name> — <price> ₼" (or "-", various dashes) lines out of the
  // reply and resolve each to a catalog product. This is more reliable than
  // string-matching catalog SKU names, because the AI often uses generic
  // localised names (e.g. "Dəniz duzu") that don't match SKU titles
  // ("Bravo Salt 1kg") but DO match via findRelevant.
  const suggestions = extractSuggestions(text);
  return { text, relevant, suggestions };
}

const SUGGESTION_RE =
  /(?:^|\n)[\s•\-*]*([^\n—\-–·:]{2,60}?)\s*[—\-–]\s*(\d+[.,]?\d*)\s*(?:₼|AZN|manat|ман)/gi;

function extractSuggestions(reply) {
  const matches = [];
  const seen = new Set();
  let m;
  // reset lastIndex defensively in case the regex was used recently
  SUGGESTION_RE.lastIndex = 0;
  while ((m = SUGGESTION_RE.exec(reply)) !== null) {
    const rawName = m[1].trim().replace(/^[\d.)\s•\-*]+/, "");
    if (!rawName || rawName.length < 2) continue;
    const hits = findRelevant(rawName, 4);
    const product = hits.find((h) => !seen.has(h.product_id)) || hits[0];
    if (!product) continue;
    seen.add(product.product_id);
    matches.push(product);
  }
  return matches.slice(0, 4);
}

const ADMIN_SYSTEM = `You are a senior retail inventory analyst speaking directly to the store manager at a Bravo supermarket. You receive a structured snapshot of stock levels, 30-day sales velocity, and expiry status for the most flagged SKUs.

Write a short, conversational store-manager briefing — 3 short paragraphs, no bullets, no markdown, no headers. Speak in the second person ("you should…"). Name specific products and brands. Quote concrete numbers (units, days, % discount, reorder qty) and reasoning. Lead with the most urgent items.

Structure:
1. Opening paragraph: what needs action TODAY (expiring items + their suggested markdowns).
2. Middle paragraph: what to reorder this week (low stock + suggested quantities).
3. Closing paragraph: slow-movers — name 2–3 overstocked items and suggest specific markdowns to clear them.

Each paragraph must be 2–3 sentences max. Total reply ≤ 130 words. Never invent numbers — only use what's in the snapshot. Match the manager's professional tone, not casual.`;

// ── Recipe → ingredients flow ─────────────────────────────────────────────
const RECIPE_INTENT_RE =
  /(i\s*want\s*to\s*(make|cook|prepare)|how\s*(do\s*i|to)\s*(make|cook|prepare)|recipe\s*(for|of)|give\s*me\s*(a\s*)?recipe|hazırla|hazırlaya|bişir|necə\s*hazırlanır|necə\s*bişiril|reseptini|resept|yemək|готовить|рецепт|приготовить|что\s*приготовить|сделать\s*на\s*ужин|сделать\s*на\s*обед)/i;

export function isRecipeIntent(text) {
  return RECIPE_INTENT_RE.test(text);
}

const RECIPE_SYSTEM = `You are a recipe assistant. The user wants to cook something.

Respond ONLY with a valid JSON object — no markdown, no commentary — with this exact shape:
{
  "dish": "Spaghetti Bolognese",
  "language": "en",
  "ingredients": ["pasta", "ground beef", "tomato sauce", "onion", "garlic"],
  "smart_additions": ["olive oil", "parmesan cheese", "fresh basil"]
}

Rules:
- "ingredients" = the 4–6 ESSENTIALS the dish actually needs. Generic English nouns ("pasta" not "Barilla spaghetti"). No water/salt/black-pepper unless it's the defining seasoning.
- "smart_additions" = 2–3 common STAPLES OR COMPLEMENTS shoppers usually forget — oil, garlic, herbs, condiments, side items, or pairings (bread, salad greens, wine). They should be items a customer probably has at home but might want to top up while they're in the store.
- Generic English nouns for both lists, even if the user wrote in Azerbaijani — they have to match the English product catalogue.
- "language" is the user's language code ("en", "az", "ru").
- If the message isn't a cooking request, return {"dish": null, "language": "en", "ingredients": [], "smart_additions": []}.
- Output JSON only.`;

export async function getRecipe(query) {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: RECIPE_SYSTEM },
        { role: "user", content: query },
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: "json_object" },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `AI error (${res.status})`);
  }
  let parsed;
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch (_) {
    return null;
  }
  if (!parsed?.dish || !Array.isArray(parsed.ingredients) || !parsed.ingredients.length) {
    return null;
  }
  // Match each ingredient to a single product from the catalog (top score).
  const seenIds = new Set();
  const matched = parsed.ingredients.map((name) => {
    const hits = findRelevant(name, 4);
    const product = hits.find((h) => !seenIds.has(h.product_id)) || hits[0] || null;
    if (product) seenIds.add(product.product_id);
    return { name, product };
  });

  // Smart additions: deliberately biased toward COLD aisles so shoppers'
  // walking path drives traffic through the store's under-trafficked zones.
  const additions = Array.isArray(parsed.smart_additions)
    ? parsed.smart_additions.map((name) => {
        const hits = findCold(name, 4);
        const product =
          hits.find((h) => !seenIds.has(h.product_id)) || hits[0] || null;
        if (product) seenIds.add(product.product_id);
        return { name, product };
      })
    : [];

  return {
    dish: parsed.dish,
    language: parsed.language || "en",
    ingredients: matched,
    smart_additions: additions.filter((a) => a.product),
  };
}

const PRODUCT_ANALYSIS_SYSTEM = `You are a senior retail inventory analyst at Bravo, speaking directly to the store manager about ONE specific product.

Write a 3–4 sentence conversational analysis. Use the exact numbers provided. Cover:
1) What's the current situation (stock, velocity, expiry if relevant).
2) Why this matters (revenue at risk / opportunity cost / waste risk).
3) Recommended concrete action with a number (e.g. "discount by 20% for the next 7 days", "reorder 250 units", "move to clearance shelf today").

No bullets, no markdown, no preamble. Second person ("you"). Plain professional tone. ≤ 90 words.`;

export async function analyzeProduct(product) {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }
  const lines = [
    `Product: ${product.name} (${product.brand})`,
    `SKU: ${product.sku}`,
    `Category: ${product.category} / ${product.subcategory}`,
    `Size: ${product.size}`,
    `Price: ${product.price_azn} ₼`,
    `Stock on hand: ${product.stock_qty} units`,
    `Sold last 30 days: ${product.units_sold} units`,
    `Days of stock at current pace: ${product.days_of_stock}`,
    product.is_fresh
      ? `Fresh item — days until expiry: ${product.expires_in_days}`
      : `Shelf-stable — days until expiry: ${product.expires_in_days}`,
    product.fat_percentage != null ? `Fat: ${product.fat_percentage}%` : null,
    `Location: ${product.location}`,
    `Status flag: ${product.status}`,
    `Rating: ${product.rating}/5`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: PRODUCT_ANALYSIS_SYSTEM },
        { role: "user", content: lines },
      ],
      temperature: 0.3,
      max_tokens: 250,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `AI error (${res.status})`);
  }
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "Could not generate analysis."
  );
}

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
