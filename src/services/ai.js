// ── Receipt Image Scanner → Shelf Navigation ──────────────────────────────
const RECEIPT_SCAN_SYSTEM = `You are a receipt/shopping-list OCR and product matcher for Bravo supermarket.

The user sends an image of a receipt, handwritten list, or printed shopping list.

Respond ONLY with a valid JSON object — no markdown, no commentary — with this exact shape:
{
  "language": "en|az|ru",
  "items": ["pasta", "chicken breast", "milk", "tomatoes"]
}

Rules:
- Extract EVERY distinct grocery/product item from the image.
- Normalize to generic English nouns ("chicken breast" not "Toyuq döşü 1kg"). This is critical — they must match the English product catalogue.
- Remove duplicates, quantities, prices, store names, dates, totals, tax lines.
- If you cannot read the image or it contains no grocery items, return: {"language": "en", "items": []}
- Output JSON only.`;

/**
 * Scans a receipt or shopping list image and returns matched catalog products
 * with shelf/aisle navigation.
 *
 * @param {string} base64Image  - Base64-encoded image (no data URI prefix).
 * @param {string} mediaType    - MIME type: "image/jpeg" | "image/png" | "image/webp"
 * @param {string} [language]   - Detected UI language ("en" | "az" | "ru"), default "en"
 * @returns {Promise<ReceiptScanResult>}
 *
 * @typedef {Object} ReceiptScanResult
 * @property {string}   language    - User's language
 * @property {Array<{name: string, product: object|null, aisle: string|null}>} items
 * @property {Array<string>} aisleRoute  - Ordered list of unique aisles to visit
 * @property {number}  totalEstimate    - Sum of matched product prices in AZN
 */
export async function scanReceipt(base64Image, mediaType = "image/jpeg", language = "en") {
  if (!API_KEY) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env, then restart Expo."
    );
  }

  // Step 1 — OCR: send image to the vision model to extract item names.
  const ocrRes = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      // Use the vision-capable model for image understanding.
      // llama-3.2-11b-vision-preview supports image inputs on Groq.
      model: "llama-3.2-11b-vision-preview",
      messages: [
        { role: "system", content: RECEIPT_SCAN_SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: "Extract all grocery items from this receipt or shopping list image.",
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  const ocrData = await ocrRes.json();
  if (!ocrRes.ok) {
    throw new Error(ocrData?.error?.message || `Vision API error (${ocrRes.status})`);
  }

  let parsed;
  try {
    parsed = JSON.parse(ocrData.choices[0].message.content);
  } catch (_) {
    return _emptyReceiptResult(language);
  }

  const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
  if (rawItems.length === 0) {
    return _emptyReceiptResult(parsed?.language || language);
  }

  // Step 2 — Catalog matching: resolve each item name to a catalog product.
  const seen = new Set();
  const items = rawItems.map((name) => {
    const hits = findRelevant(name, 4);
    const product = hits.find((h) => !seen.has(h.product_id)) || hits[0] || null;
    if (product) seen.add(product.product_id);

    // Extract aisle from location field, e.g. "Aisle 3 / Shelf B" → "Aisle 3"
    const aisle = product?.location
      ? _parseAisle(product.location)
      : null;

    return { name, product, aisle };
  });

  // Step 3 — Build an optimised aisle route (unique aisles in encounter order,
  // null aisles grouped at the end so the shopper isn't sent to unknown spots).
  const aisleRoute = _buildAisleRoute(items);

  // Step 4 — Estimate total cost of matched items.
  const totalEstimate = items.reduce((sum, { product }) => {
    return sum + (product?.price_azn ? parseFloat(product.price_azn) : 0);
  }, 0);

  return {
    language: parsed?.language || language,
    items,
    aisleRoute,
    totalEstimate: Math.round(totalEstimate * 100) / 100,
  };
}

/** Pull the aisle label out of a location string. */
function _parseAisle(location) {
  if (!location) return null;
  // Matches patterns like "Aisle 3", "Koridor 2", "Ряд 5", "A3", "Section B"
  const m = location.match(/(?:Aisle|Koridor|Ряд|Row|Section|Shelf|Rəf)\s*[\w\d]+/i);
  return m ? m[0] : location.split(/[,/|]/)[0].trim();
}

/** Return a deduped, ordered list of aisles to visit. Nulls go last. */
function _buildAisleRoute(items) {
  const seen = new Set();
  const route = [];
  const unknown = [];

  for (const { aisle } of items) {
    if (!aisle) {
      unknown.push("Unknown");
      continue;
    }
    if (!seen.has(aisle)) {
      seen.add(aisle);
      route.push(aisle);
    }
  }

  // Append unknown items once at the end if any
  if (unknown.length > 0) route.push("Unknown location");
  return route;
}

function _emptyReceiptResult(language = "en") {
  return { language, items: [], aisleRoute: [], totalEstimate: 0 };
}