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

export function getProducts() {
  if (_parsed) return _parsed;
  const lines = PRODUCTS_CSV.trim().split("\n");
  _headerLine = lines[0];
  const headers = _headerLine.split(",");
  _parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
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

export function toCSV(products) {
  const header = getHeader();
  const lines = [header];
  const keys = header.split(",");
  for (const p of products) {
    lines.push(keys.map((k) => p[k] ?? "").join(","));
  }
  return lines.join("\n");
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
