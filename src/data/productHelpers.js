import { PRODUCTS_CSV } from "./products";

let _parsed = null;
let _headerLine = null;

// All static fields (location, units_sold, expires_in_days, fat_percentage,
// is_fresh, aisle_num, shelf_letter) live in the CSV — see
// scripts/enrichCsv.js. We only compute days_of_stock and the status flag
// here because those depend on combinations of velocity and price.
function fromRow(obj) {
  const stock_qty = parseInt(obj.stock_qty, 10) || 0;
  const price_azn = parseFloat(obj.price_azn) || 0;
  const units_sold = parseInt(obj.units_sold, 10) || 0;
  const expires_in_days = parseFloat(obj.expires_in_days) || 0;
  const is_fresh = obj.is_fresh === "true";
  const fat_percentage = obj.fat_percentage === "" || obj.fat_percentage == null
    ? null
    : parseFloat(obj.fat_percentage);

  const daily = units_sold / 30;
  const days_of_stock = daily > 0 ? stock_qty / daily : 999;

  let status = "ok";
  if (is_fresh && expires_in_days <= 1.0) status = "expiring";
  else if (days_of_stock < 3) status = "low_stock";
  else if (days_of_stock > 60 && units_sold < 100) status = "overstocked";

  return {
    ...obj,
    stock_qty,
    price_azn,
    units_sold,
    expires_in_days,
    is_fresh,
    fat_percentage,
    aisle_num: parseInt(obj.aisle_num, 10) || 0,
    rating: parseFloat(obj.rating) || 0,
    days_of_stock: Math.round(days_of_stock * 10) / 10,
    status,
  };
}

// RFC-4180-ish parser: handles fields with embedded commas wrapped in
// double-quotes (e.g. "Fresh Produce, Meat & Dairy") and escaped "" quotes.
function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else if (ch === '"' && cur === "") {
      inQuotes = true;
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function getProducts() {
  if (_parsed) return _parsed;
  const lines = PRODUCTS_CSV.trim().split("\n");
  _headerLine = lines[0];
  const headers = parseCSVLine(_headerLine);
  _parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = cols[j];
    _parsed.push(fromRow(obj));
  }
  return _parsed;
}

export function getHeader() {
  if (!_headerLine) getProducts();
  return _headerLine;
}

const STOP = new Set([
  "the", "and", "for", "with", "from", "what", "where", "when", "have", "has",
  "any", "all", "some", "show", "find", "want", "need", "give", "list", "tell",
  "azn", "manat", "üçün", "var", "haqqında",
]);

// Azerbaijani / Russian → English category & keyword synonyms. We expand
// query tokens before scoring so an Azerbaijani query can match the English
// product catalogue.
const SYNONYMS = {
  qəlyanaltı: ["snack", "chips", "biscuit", "cracker", "nut"],
  qəlyanaltılar: ["snack", "chips", "biscuit", "cracker", "nut"],
  snek: ["snack", "chips", "biscuit"],
  süd: ["milk", "dairy"],
  pendir: ["cheese", "dairy"],
  yoğurt: ["yogurt", "dairy"],
  yumurta: ["egg"],
  çörək: ["bread", "bakery"],
  bulka: ["bun", "bread", "bakery"],
  şirniyyat: ["candy", "chocolate", "sweet", "confection"],
  şokolad: ["chocolate"],
  konfet: ["candy", "chocolate"],
  meyvə: ["fruit", "produce"],
  meyvələr: ["fruit", "produce"],
  alma: ["apple"],
  portağal: ["orange"],
  banan: ["banana"],
  tərəvəz: ["vegetable", "produce"],
  pomidor: ["tomato"],
  xiyar: ["cucumber"],
  kartof: ["potato"],
  soğan: ["onion"],
  ət: ["meat", "beef", "chicken", "lamb", "pork"],
  toyuq: ["chicken", "poultry"],
  mal: ["beef"],
  balıq: ["fish", "seafood", "tuna", "salmon"],
  içki: ["beverage", "drink", "water", "juice", "soda"],
  içkilər: ["beverage", "drink"],
  su: ["water"],
  şirə: ["juice"],
  qəhvə: ["coffee"],
  çay: ["tea"],
  pivə: ["beer"],
  təmizlik: ["cleaning", "detergent", "household"],
  sabun: ["soap"],
  şampun: ["shampoo"],
  body: ["body"],
  uşaq: ["baby", "kids"],
  diş: ["tooth", "toothpaste", "dental"],
  yağ: ["oil"],
  un: ["flour"],
  düyü: ["rice"],
  makaron: ["pasta", "spaghetti"],
  şəkər: ["sugar"],
  duz: ["salt"],
  bal: ["honey"],
  halal: ["halal"],
  vegan: ["vegan"],
  protein: ["protein"],
  sağlam: ["healthy", "diet", "organic"],
};

const CHEAP_RE = /(under|below|less than|cheap|altı|aşağı|ucuz|az qiymət|qiyməti az)/i;

function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function expandTokens(tokens) {
  const expanded = new Set();
  for (const t of tokens) {
    expanded.add(t);
    const syn = SYNONYMS[t];
    if (syn) for (const s of syn) expanded.add(s);
  }
  return [...expanded];
}

export function findRelevant(query, limit = 30) {
  const products = getProducts();
  const baseTokens = tokenize(query);
  const tokens = expandTokens(baseTokens);

  const priceMatch = query.match(/(\d+(?:\.\d+)?)/);
  const priceCap =
    CHEAP_RE.test(query) && priceMatch ? parseFloat(priceMatch[1]) : null;

  let candidates = products;
  if (priceCap != null) {
    candidates = candidates.filter((p) => p.price_azn <= priceCap);
  }

  if (tokens.length === 0) {
    return (priceCap != null ? candidates : sample(candidates, limit * 3)).slice(0, limit);
  }

  const scored = candidates.map((p) => {
    const hay = `${p.name} ${p.brand} ${p.category} ${p.subcategory}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 2;
    }
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((x) => x.score > 0).slice(0, limit);
  return top.map((x) => x.p); // may be empty — caller should handle
}

function sample(arr, n) {
  if (arr.length <= n) return arr.slice();
  const out = [];
  const seen = new Set();
  while (out.length < n && seen.size < arr.length) {
    const i = Math.floor(Math.random() * arr.length);
    if (!seen.has(i)) {
      seen.add(i);
      out.push(arr[i]);
    }
  }
  return out;
}

function csvCell(v) {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toCSV(products) {
  const header = getHeader();
  const lines = [header];
  const keys = parseCSVLine(header);
  for (const p of products) {
    lines.push(keys.map((k) => csvCell(p[k])).join(","));
  }
  return lines.join("\n");
}

// ── Smart markdown engine ──────────────────────────────────────────────────
// Progressive auto-discount based on expiry urgency / slow movement.
// Returns { pct, reason } — pct is 0..50.
export function getDiscount(p) {
  if (p.is_fresh) {
    if (p.expires_in_days <= 0.5) return { pct: 50, reason: "Expires today" };
    if (p.expires_in_days <= 1) return { pct: 30, reason: "Expires tomorrow" };
    if (p.expires_in_days <= 1.5) return { pct: 15, reason: "Last day of freshness" };
  }
  if (p.status === "overstocked") {
    if (p.days_of_stock > 120) return { pct: 30, reason: "Clearance — heavy overstock" };
    if (p.days_of_stock > 60) return { pct: 20, reason: "Slow mover" };
  }
  return { pct: 0, reason: null };
}

export function effectivePrice(p) {
  const d = getDiscount(p);
  return d.pct > 0
    ? Math.round(p.price_azn * (1 - d.pct / 100) * 100) / 100
    : p.price_azn;
}

// ── Dietary tags ───────────────────────────────────────────────────────────
const DIET_PATTERNS = {
  halal: /pork|bacon|ham|sausage|salami|prosciutto|beer|wine|vodka|whisky|alcohol|rum|gin|liqueur/i,
  vegan:
    /meat|chicken|beef|lamb|pork|fish|seafood|tuna|salmon|dairy|milk|cream|butter|cheese|yogurt|egg|honey|gelatin/i,
  vegetarian:
    /meat|chicken|beef|lamb|pork|fish|seafood|tuna|salmon|sausage|bacon|ham|gelatin/i,
  glutenfree: /bread|pasta|wheat|baguette|biscuit|cracker|cookie|cake|cereal|flour|noodle/i,
  lactosefree: /milk|cream|butter|cheese|yogurt|dairy|ice cream/i,
};

export function dietaryTags(p) {
  const h = `${p.name} ${p.category} ${p.subcategory}`.toLowerCase();
  const tags = [];
  if (!DIET_PATTERNS.halal.test(h)) tags.push("halal");
  if (!DIET_PATTERNS.vegan.test(h)) tags.push("vegan");
  if (!DIET_PATTERNS.vegetarian.test(h)) tags.push("vegetarian");
  if (!DIET_PATTERNS.glutenfree.test(h)) tags.push("glutenfree");
  if (!DIET_PATTERNS.lactosefree.test(h)) tags.push("lactosefree");
  return tags;
}

export function filterByDiet(products, tag) {
  if (!tag) return products;
  return products.filter((p) => {
    if (!p._diet) p._diet = dietaryTags(p);
    return p._diet.includes(tag);
  });
}

// ── Premium perks ──────────────────────────────────────────────────────────
// Premium perks are now non-monetary (early-access markdowns, meal plan).
// The function stays for backwards compatibility with PriceWithDiscount call
// sites, but always returns 0 so no extra loyalty chip renders.
export function loyaltyDiscount(_user) {
  return 0;
}

export function premiumPrice(p, user) {
  const base = effectivePrice(p);
  const loyalty = loyaltyDiscount(user);
  if (loyalty <= 0) return base;
  return Math.round(base * (1 - loyalty / 100) * 100) / 100;
}

export function totalDiscountPct(p, user) {
  const basePct = getDiscount(p).pct;
  const loyalty = loyaltyDiscount(user);
  if (loyalty <= 0) return basePct;
  // Compound: 1 − (1 − base)(1 − loyalty)
  const combined = 1 - (1 - basePct / 100) * (1 - loyalty / 100);
  return Math.round(combined * 100);
}

// Items that are NOT yet publicly discounted, but will be within 1–2 days —
// premium members see them now. Predicts the discount that will apply once
// the item crosses the public threshold.
export function getUpcomingDeals(limit = 30) {
  const products = getProducts();
  const previews = [];
  for (const p of products) {
    if (getDiscount(p).pct > 0) continue; // already discounted publicly

    if (p.is_fresh && p.expires_in_days > 1.5 && p.expires_in_days <= 3) {
      // Will hit the fresh-markdown threshold within ~1–2 days.
      previews.push({
        ...p,
        previewDiscount: p.expires_in_days <= 2 ? 15 : 10,
        activeInDays: Math.max(1, Math.round((p.expires_in_days - 1.5) * 10) / 10),
        reason: "Expires soon — early bird preview",
      });
      continue;
    }
    if (
      !p.is_fresh &&
      p.status !== "overstocked" &&
      p.days_of_stock > 45 &&
      p.days_of_stock <= 60 &&
      p.units_sold < 120
    ) {
      // Will hit overstocked threshold soon.
      previews.push({
        ...p,
        previewDiscount: 15,
        activeInDays: Math.max(1, Math.round(60 - p.days_of_stock)),
        reason: "Slow-mover — markdown coming soon",
      });
    }
  }
  return previews
    .sort((a, b) => a.activeInDays - b.activeInDays)
    .slice(0, limit);
}

// ── Rescue Today: items currently marked down by the engine ────────────────
export function getRescueItems(limit = 60) {
  const products = getProducts();
  return products
    .map((p) => ({ ...p, discount: getDiscount(p) }))
    .filter((p) => p.discount.pct > 0)
    .sort((a, b) => {
      // Most urgent first: expiring beats overstocked, then higher discount.
      if (a.is_fresh !== b.is_fresh) return a.is_fresh ? -1 : 1;
      if (a.is_fresh && b.is_fresh) return a.expires_in_days - b.expires_in_days;
      return b.discount.pct - a.discount.pct;
    })
    .slice(0, limit);
}

// ── Aisle traffic (mock) ───────────────────────────────────────────────────
// Deterministic per-aisle visitor counts for the week, modelled on typical
// supermarket traffic distribution (entrance + bakery & produce highest,
// pet/baby lowest).
const AISLE_NAMES = {
  1: "Bakery",
  2: "Produce",
  3: "Dairy",
  4: "Meat & Fish",
  5: "Beverages",
  6: "Snacks",
  7: "Pantry",
  8: "Frozen",
  9: "Cleaning",
  10: "Personal Care",
  11: "Baby",
  12: "Pet",
};
const AISLE_POPULARITY = {
  1: 0.92,
  2: 0.95,
  3: 0.88,
  4: 0.62,
  5: 0.78,
  6: 0.74,
  7: 0.55,
  8: 0.42,
  9: 0.28,
  10: 0.48,
  11: 0.22,
  12: 0.18,
};

export function getTrafficByAisle() {
  return Object.keys(AISLE_NAMES)
    .map((k) => {
      const aisle = parseInt(k, 10);
      return {
        aisle,
        name: AISLE_NAMES[aisle],
        visitors: Math.round(2400 * AISLE_POPULARITY[aisle]),
        popularity: AISLE_POPULARITY[aisle],
      };
    })
    .sort((a, b) => b.visitors - a.visitors);
}

// ── Smart placement (move overstocked items to high-traffic aisles) ────────
// ── Traffic-aware product lookup ───────────────────────────────────────────
// Returns matches for the query but biased toward COLD aisles. The point is
// to route shoppers through under-trafficked sections of the store so the
// store's cold zones see more impressions/conversion without moving stock.
export function findCold(query, limit = 5) {
  const matches = findRelevant(query, 24);
  return matches
    .map((p) => ({
      ...p,
      _coldScore: 1 - (AISLE_POPULARITY[p.aisle_num] ?? 0.5), // colder = higher
    }))
    .sort((a, b) => b._coldScore - a._coldScore)
    .slice(0, limit);
}

export function aislePopularity(aisleNum) {
  return AISLE_POPULARITY[aisleNum] ?? 0.5;
}

export function getPlacementSuggestions(limit = 3) {
  const a = getAnalytics();
  const traffic = getTrafficByAisle();
  const high = traffic.slice(0, 3);
  const lowestVisitors = traffic[traffic.length - 1].visitors || 1;

  // Pair the slowest-moving overstocked items with the busiest aisles.
  return a.overstocked
    .filter((p) => {
      const currentTraffic = AISLE_POPULARITY[p.aisle_num] || 0.5;
      return currentTraffic < 0.6; // currently in a low-traffic aisle
    })
    .slice(0, limit)
    .map((p, i) => {
      const target = high[i % high.length];
      const ratio = Math.max(2, Math.round(target.visitors / lowestVisitors));
      return {
        product: p,
        currentAisle: p.aisle_num,
        currentDept: AISLE_NAMES[p.aisle_num] || "—",
        suggestedAisle: target.aisle,
        suggestedDept: target.name,
        narrative: `Move a display of ${p.name} from Aisle ${p.aisle_num} (${
          AISLE_NAMES[p.aisle_num] || "low traffic"
        }) to a secondary end-cap near Aisle ${target.aisle} (${
          target.name
        }) — that zone gets ${target.visitors.toLocaleString()} visits/week, ${ratio}× more than its current placement. ${
          p.stock_qty
        } units in stock; expected to move ~${Math.round(
          p.stock_qty * 0.35
        )} extra units over the next 2 weeks at the higher-visibility spot.`,
      };
    });
}

// ── Restock plan ────────────────────────────────────────────────────────────
// Concrete reorder list with quantities, timing, and waste-aware narrative
// (fresh items get a smaller order even if velocity is high, to avoid the
// next batch expiring on the shelf).
export function getRestockPlan(limit = 12) {
  const products = getProducts();
  return products
    .filter((p) => p.status === "low_stock")
    .map((p) => {
      const daily = p.units_sold / 30;
      const targetCoverDays = p.is_fresh ? Math.min(7, p.expires_in_days * 3 + 5) : 14;
      const reorderQty = Math.max(p.is_fresh ? 30 : 60, Math.round(daily * targetCoverDays));
      const urgency =
        p.days_of_stock < 1 ? "today" :
        p.days_of_stock < 3 ? "within 24h" :
        "this week";
      const waste = p.is_fresh
        ? ` Fresh item — limiting order to ${targetCoverDays}-day cover (~${reorderQty} units) to avoid the next batch expiring on shelf.`
        : ` Order ${reorderQty} units to cover the next 2 weeks at the current ${Math.round(
            daily
          )} units/day pace.`;
      const narrative =
        `${p.name} (Aisle ${p.aisle_num} · ${AISLE_NAMES[p.aisle_num] || "?"}) — ${p.stock_qty} units left, selling ~${Math.round(
          daily
        )} units/day, ${p.days_of_stock} day${p.days_of_stock === 1 ? "" : "s"} of cover remaining. Reorder ${urgency}.${waste}`;
      return {
        ...p,
        reorderQty,
        urgency,
        targetCoverDays,
        narrative,
      };
    })
    .sort((a, b) => a.days_of_stock - b.days_of_stock)
    .slice(0, limit);
}

// Rule-based recommendation: severity (urgency rank), action verb, narrative.
export function recommend(p) {
  const daily = p.units_sold / 30;

  if (p.status === "expiring") {
    const markdown =
      p.expires_in_days <= 0.5 ? 50 : p.expires_in_days <= 1 ? 35 : 25;
    return {
      severity: 10 - p.expires_in_days, // closer to expiry = higher
      action: "Mark down & clearance",
      narrative: `${p.name} expires in ${p.expires_in_days} day${
        p.expires_in_days === 1 ? "" : "s"
      } — apply a ${markdown}% markdown and move ${p.stock_qty} units to the front-of-store clearance display before close of business.`,
      markdownPct: markdown,
      reorderQty: 0,
    };
  }

  if (p.status === "low_stock") {
    const reorderQty = Math.max(60, Math.round(daily * 14)); // 2 weeks cover
    return {
      severity: 8 - p.days_of_stock,
      action: "Restock urgently",
      narrative: `${p.name} only has ${p.days_of_stock} days of stock left at the current sell-through of ${Math.round(
        daily
      )} units/day. Reorder ~${reorderQty} units to cover the next 2 weeks.`,
      markdownPct: 0,
      reorderQty,
    };
  }

  if (p.status === "overstocked") {
    const cover = p.days_of_stock;
    const markdown = cover > 120 ? 30 : cover > 90 ? 20 : 15;
    return {
      severity: Math.min(6, cover / 30),
      action: `Apply ${markdown}% discount`,
      narrative: `${p.name} has ${p.stock_qty} units in stock — about ${Math.round(
        cover
      )} days of inventory at the current pace. Drop the price by ${markdown}% to move ${Math.round(
        p.stock_qty * 0.4
      )} units in the next 2 weeks.`,
      markdownPct: markdown,
      reorderQty: 0,
    };
  }

  return {
    severity: 0,
    action: "Healthy",
    narrative: `${p.name} is selling at a healthy pace — no action needed.`,
    markdownPct: 0,
    reorderQty: 0,
  };
}

let _analytics = null;

export function getAnalytics() {
  if (_analytics) return _analytics;
  const products = getProducts();

  let totalUnits = 0;
  let totalRevenue = 0;
  let totalStockValue = 0;
  const lowStock = [];
  const overstocked = [];
  const expiring = [];
  const byCategory = new Map();

  for (const p of products) {
    totalUnits += p.units_sold;
    totalRevenue += p.units_sold * p.price_azn;
    totalStockValue += p.stock_qty * p.price_azn;

    const c = p.category || "Other";
    const agg = byCategory.get(c) || { category: c, units: 0, revenue: 0, count: 0 };
    agg.units += p.units_sold;
    agg.revenue += p.units_sold * p.price_azn;
    agg.count += 1;
    byCategory.set(c, agg);

    if (p.status === "low_stock") lowStock.push(p);
    else if (p.status === "overstocked") overstocked.push(p);
    if (p.status === "expiring") expiring.push(p);
  }

  lowStock.sort((a, b) => a.days_of_stock - b.days_of_stock);
  overstocked.sort((a, b) => b.stock_qty - a.stock_qty);
  expiring.sort((a, b) => a.expires_in_days - b.expires_in_days);

  const categories = [...byCategory.values()].sort((a, b) => b.revenue - a.revenue);

  _analytics = {
    totalProducts: products.length,
    totalUnits,
    totalRevenue: Math.round(totalRevenue),
    totalStockValue: Math.round(totalStockValue),
    lowStock,
    overstocked,
    expiring,
    categories,
  };
  return _analytics;
}

export function buildInsightContext() {
  const a = getAnalytics();
  const fmt = (p) =>
    `${p.name} (${p.brand}) — stock ${p.stock_qty}, sold ${p.units_sold}/30d, price ${p.price_azn} ₼${
      p.is_fresh ? `, expires in ${p.expires_in_days}d` : ""
    }, ${p.location}`;
  return [
    `Total products: ${a.totalProducts}`,
    `Total units sold (last 30 days): ${a.totalUnits}`,
    `Total revenue (last 30 days): ${a.totalRevenue} ₼`,
    `Total inventory value at retail: ${a.totalStockValue} ₼`,
    "",
    `TOP 8 LOW-STOCK (needs restock urgently):`,
    ...a.lowStock.slice(0, 8).map((p) => `  • ${fmt(p)} — only ${p.days_of_stock} days of stock left`),
    "",
    `TOP 8 OVERSTOCKED (slow movers, consider discounts):`,
    ...a.overstocked.slice(0, 8).map((p) => `  • ${fmt(p)} — ${p.days_of_stock} days of stock`),
    "",
    `TOP 8 EXPIRING (fresh items expiring within 1 day):`,
    ...a.expiring.slice(0, 8).map((p) => `  • ${fmt(p)}`),
    "",
    `TOP 5 CATEGORIES by revenue:`,
    ...a.categories
      .slice(0, 5)
      .map((c) => `  • ${c.category} — ${Math.round(c.revenue)} ₼ across ${c.count} SKUs`),
  ].join("\n");
}

// Top-N highest-priority items across all buckets, each with rule-based copy.
export function getCriticalActions(limit = 12) {
  const a = getAnalytics();
  const all = [...a.expiring, ...a.lowStock, ...a.overstocked];
  const seen = new Set();
  const enriched = [];
  for (const p of all) {
    if (seen.has(p.product_id)) continue;
    seen.add(p.product_id);
    enriched.push({ ...p, recommendation: recommend(p) });
  }
  enriched.sort((a, b) => b.recommendation.severity - a.recommendation.severity);
  return enriched.slice(0, limit);
}

// Stock-health breakdown for the donut chart.
// ── Morning Mission ─────────────────────────────────────────────────────────
// Three highest-impact actions for the manager, today. Each has a quantified
// ₼ impact, a one-line action, and the supporting product reference so the
// card can show the manager exactly what to approve.
export function getMorningMissions() {
  const a = getAnalytics();
  const missions = [];

  // Discount mission: top overstocked SKU by stock value.
  const overstockRanked = [...a.overstocked].sort(
    (x, y) => y.stock_qty * y.price_azn - x.stock_qty * x.price_azn
  );
  const topOver = overstockRanked[0];
  if (topOver) {
    const rec = recommend(topOver);
    const expectedClear = Math.round(topOver.stock_qty * 0.4);
    const expectedRevenue = Math.round(
      expectedClear * topOver.price_azn * (1 - rec.markdownPct / 100)
    );
    missions.push({
      id: `discount-${topOver.product_id}`,
      type: "discount",
      title: "Discount today",
      impact: expectedRevenue,
      impactLabel: "Expected 2-wk revenue",
      product: topOver,
      action: `Drop price ${rec.markdownPct}% until Friday`,
      narrative: rec.narrative,
      recommendation: rec,
    });
  }

  // Reorder mission: most urgent low-stock SKU.
  const restocks = getRestockPlan(3);
  if (restocks.length > 0) {
    const p = restocks[0];
    const daily = p.units_sold / 30;
    // Lost sales avoided if we restock in time vs running out
    const lostSalesAvoided = Math.round(
      daily * Math.max(0, p.targetCoverDays - p.days_of_stock) * p.price_azn * 0.6
    );
    missions.push({
      id: `restock-${p.product_id}`,
      type: "restock",
      title: "Reorder",
      impact: lostSalesAvoided,
      impactLabel: "Lost-sales avoided",
      product: p,
      action: `Order ${p.reorderQty} units · ${p.urgency}`,
      narrative: p.narrative,
    });
  }

  // Move-stock mission: overstocked items currently in cold aisles.
  const placements = getPlacementSuggestions(3);
  if (placements.length > 0) {
    const ps = placements[0];
    const traffic = getTrafficByAisle();
    const topHotAisles = traffic.slice(0, 3); // 3 busiest aisles in the store
    const moveUnits = Math.round(ps.product.stock_qty * 0.3);
    const extraSold = Math.round(ps.product.stock_qty * 0.35);
    const extraRevenue = Math.round(extraSold * ps.product.price_azn);
    missions.push({
      id: `move-${ps.product.product_id}`,
      type: "move",
      title: "Move stock",
      impact: extraRevenue,
      impactLabel: "Extra revenue (2 wk)",
      product: ps.product,
      action: `Move ~${moveUnits} units to Aisle ${ps.suggestedAisle} end-cap`,
      narrative: ps.narrative,
      suggestion: { ...ps, topHotAisles, moveUnits },
    });
  }

  return missions.sort((a, b) => b.impact - a.impact);
}

export function getStockHealth() {
  const products = getProducts();
  let ok = 0, low = 0, over = 0, exp = 0;
  for (const p of products) {
    if (p.status === "expiring") exp++;
    else if (p.status === "low_stock") low++;
    else if (p.status === "overstocked") over++;
    else ok++;
  }
  return { ok, low, over, exp, total: products.length };
}
