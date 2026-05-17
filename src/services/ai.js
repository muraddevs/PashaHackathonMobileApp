import {
  findRelevant,
  findCold,
  toCSV,
  buildInsightContext,
} from "../data/productHelpers";

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || "llama-3.3-70b-versatile";
const VISION_MODEL =
  process.env.EXPO_PUBLIC_GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

async function groqFetch(endpoint, body) {
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(
      "Network request failed. Check your phone's internet connection and try again."
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid response from AI service. Please try again.");
  }

  if (!response.ok) {
    const msg = data?.error?.message || `AI error (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

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

  const data = await groqFetch(ENDPOINT, {
    model: MODEL,
    messages,
    temperature: 0.4,
    max_tokens: 512,
  });
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
  "smart_additions": ["olive oil", "parmesan cheese", "fresh basil"],
  "pairings": [
    { "name": "red wine", "reason": "Complements the rich tomato sauce" },
    { "name": "sparkling water", "reason": "Cleanses the palate between bites" }
  ]
}

Rules:
- "ingredients" = the 4–6 ESSENTIALS the dish actually needs. Generic English nouns ("pasta" not "Barilla spaghetti"). No water/salt/black-pepper unless it's the defining seasoning.
- "smart_additions" = 2–3 common STAPLES OR COMPLEMENTS shoppers usually forget — oil, garlic, herbs, condiments, side items they probably have at home but might want to top up while they're in the store.
- "pairings" = 1–2 BEVERAGES or SIDE DISHES that go perfectly with this dish (a drink, a dessert, a salad, etc.). Each has a short "reason" (≤8 words) describing why it pairs. These are NOT essentials — they're "treat yourself" suggestions.
- Generic English nouns everywhere, even if the user wrote in Azerbaijani — they have to match the English product catalogue.
- "language" is the user's language code ("en", "az", "ru").
- If the message isn't a cooking request, return {"dish": null, "language": "en", "ingredients": [], "smart_additions": [], "pairings": []}.
- Output JSON only.`;

export async function getRecipe(query) {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }
  const data = await groqFetch(ENDPOINT, {
    model: MODEL,
    messages: [
      { role: "system", content: RECIPE_SYSTEM },
      { role: "user", content: query },
    ],
    temperature: 0.2,
    max_tokens: 300,
    response_format: { type: "json_object" },
  });
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

  // Pairings: deliberately matched WITHOUT cold-aisle bias — these are the
  // "treat yourself" beverage / dessert / side suggestions framed as
  // "Pairs perfectly with your dish — add to cart?". The reason text comes
  // from the model.
  const pairings = Array.isArray(parsed.pairings)
    ? parsed.pairings
        .map((p) => {
          if (!p || !p.name) return null;
          const hits = findRelevant(p.name, 4);
          const product =
            hits.find((h) => !seenIds.has(h.product_id)) || hits[0] || null;
          if (product) seenIds.add(product.product_id);
          return { name: p.name, reason: p.reason || "", product };
        })
        .filter((p) => p && p.product)
    : [];

  return {
    dish: parsed.dish,
    language: parsed.language || "en",
    ingredients: matched,
    smart_additions: additions.filter((a) => a.product),
    pairings,
  };
}

// ── List scan: image (camera/gallery) → list of products ───────────────────
const LIST_SCAN_SYSTEM = `You are an OCR assistant. The user shows you a photo of a handwritten or printed shopping list. Read every line and return the items.

Respond ONLY with a valid JSON object — no markdown, no commentary — with this exact shape:
{
  "items": ["milk", "bread", "eggs", "tomatoes"]
}

Rules:
- Each entry is the GENERIC English noun for the product ("milk" not "Milla Süd 1L", "tomatoes" not "Bakı pomidorları").
- If the list is written in Azerbaijani or Russian, translate to generic English nouns so they match an English product catalogue.
- Strip quantities and units ("2 kg apples" → "apples"; "1L milk" → "milk").
- Ignore non-grocery scribbles, dates, names, or instructions.
- If you cannot read any items, return {"items": []}.
- Output JSON only.`;

export async function scanListFromImage(base64Image) {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }
  if (!base64Image) {
    throw new Error("No image provided.");
  }
  const dataUrl = base64Image.startsWith("data:")
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;

  const data = await groqFetch(ENDPOINT, {
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: LIST_SCAN_SYSTEM },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  let parsed;
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch (_) {
    return { items: [], matched: [] };
  }
  const names = Array.isArray(parsed.items) ? parsed.items.filter(Boolean) : [];

  // Resolve each name to a single catalog product (top relevant hit, dedup).
  const seenIds = new Set();
  const matched = names
    .map((name) => {
      const hits = findRelevant(name, 4);
      const product =
        hits.find((h) => !seenIds.has(h.product_id)) || hits[0] || null;
      if (product) seenIds.add(product.product_id);
      return { name, product };
    })
    .filter((m) => m.product);
  return { items: names, matched };
}

// ── Sunday Meal Plan ───────────────────────────────────────────────────────
const MEAL_PLAN_SYSTEM = `You are a weekly meal planner + nutritionist for a Bravo Premium member. Return ONE week of dinners — 7 dishes total, one per day, Monday through Sunday — tuned to the user's body, goal, and dietary preferences.

Respond ONLY with a valid JSON object — no markdown, no commentary — with this exact shape:
{
  "intro": "A short one-line summary of the week (e.g. 'High-protein Mediterranean dinners tuned for muscle gain at ~2800 kcal/day').",
  "language": "en|az|ru",
  "days": [
    {
      "day": "Monday",
      "dish": "Grilled chicken with quinoa & roasted vegetables",
      "tags": ["high-protein", "mediterranean"],
      "calories": 650,
      "protein_g": 45,
      "ingredients": ["chicken breast", "quinoa", "broccoli", "olive oil", "lemon", "garlic"]
    },
    ... 7 entries total, in order Mon-Sun
  ]
}

Rules:
- 7 distinct dinners. Vary cuisines (Mediterranean, Azerbaijani, Asian, comfort, etc.) and protein sources. Don't repeat the same protein 3+ times.
- 4–7 essential ingredients per dish. Generic English nouns ("pasta" not "Barilla 500g"). Skip salt/water/pepper unless they're definitional.
- Calorie target per dinner = user's daily target ÷ 3 (rounded to nearest 25). Protein target follows the goal:
  • Muscle gain → high protein (35–50g per dinner)
  • Weight loss → moderate protein (25–35g), low calories, more vegetables
  • Maintain / healthy → balanced (20–30g protein)
- Honor every dietary preference (halal → no pork/alcohol; vegetarian → no meat; vegan → no animal products; gluten-free → no wheat/bread/pasta; lactose-free → no dairy; quick → ≤30-min prep; comfort → hearty familiar; mediterranean → olive oil/fish/vegetables).
- If the user tags "azerbaijani" or speaks Azerbaijani → include 2–3 Caucasian classics (plov, dolma, küfte, dovğa, qutab, levengi).
- "intro" is in the user's language and references the calorie target + goal.
- Output JSON only.`;

// Mifflin-St Jeor BMR × activity multiplier → daily calorie target.
export function calorieTargetFor({ weight, height, age, gender, activity, goal }) {
  const bmr =
    gender === "female"
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;
  const mul =
    { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }[activity] ||
    1.55;
  const tdee = Math.round(bmr * mul);
  if (goal === "weightloss") return Math.max(1200, tdee - 500);
  if (goal === "musclegain") return tdee + 300;
  return tdee;
}

export async function getMealPlan({
  preferences = [],
  goal = "maintain",
  bodyMeasures = null,
  language = "en",
} = {}) {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }
  const goalLabel =
    { weightloss: "weight loss", musclegain: "muscle gain", maintain: "maintain weight", healthy: "healthy eating" }[
      goal
    ] || "maintain weight";
  const calorieTarget = bodyMeasures
    ? calorieTargetFor({ ...bodyMeasures, goal })
    : null;

  const profileLines = [];
  if (bodyMeasures) {
    profileLines.push(
      `Body: ${bodyMeasures.weight} kg, ${bodyMeasures.height} cm, ${bodyMeasures.age} yo, ${bodyMeasures.gender}, ${bodyMeasures.activity} activity`
    );
  }
  profileLines.push(`Goal: ${goalLabel}.`);
  if (calorieTarget) {
    profileLines.push(`Daily calorie target: ~${calorieTarget} kcal (≈${Math.round(calorieTarget / 3)} kcal per dinner).`);
  }
  const prefText = preferences.length
    ? `Dietary / style preferences: ${preferences.join(", ")}.`
    : "No specific dietary preferences — pick a balanced variety.";

  const userPrompt = `${profileLines.join("\n")}\n${prefText}\nUser's language: ${language}.\nGenerate the 7-dinner meal plan now.`;

  const data = await groqFetch(ENDPOINT, {
    model: MODEL,
    messages: [
      { role: "system", content: MEAL_PLAN_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1200,
    response_format: { type: "json_object" },
  });
  let parsed;
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch (_) {
    return null;
  }
  if (!parsed?.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
    return null;
  }

  // Resolve every ingredient to a catalog product. Bias smart-additions
  // toward cold aisles isn't applied here — meal planning prioritises
  // semantic match.
  const seen = new Set();
  const days = parsed.days.slice(0, 7).map((d) => {
    const ingredients = (d.ingredients || []).map((name) => {
      const hits = findRelevant(name, 4);
      const product =
        hits.find((h) => !seen.has(h.product_id)) || hits[0] || null;
      if (product) seen.add(product.product_id);
      return { name, product };
    });
    return {
      day: d.day || "",
      dish: d.dish || "",
      tags: d.tags || [],
      calories: d.calories || null,
      protein_g: d.protein_g || null,
      ingredients,
    };
  });
  return {
    intro: parsed.intro || "",
    language: parsed.language || language,
    calorieTarget,
    goal,
    days,
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

  const data = await groqFetch(ENDPOINT, {
    model: MODEL,
    messages: [
      { role: "system", content: PRODUCT_ANALYSIS_SYSTEM },
      { role: "user", content: lines },
    ],
    temperature: 0.3,
    max_tokens: 250,
  });
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
  const data = await groqFetch(ENDPOINT, {
    model: MODEL,
    messages: [
      { role: "system", content: ADMIN_SYSTEM },
      { role: "user", content: context },
    ],
    temperature: 0.3,
    max_tokens: 700,
  });
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "Could not generate insights."
  );
}