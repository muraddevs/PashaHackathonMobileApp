import { PRODUCTS_CSV } from "./products";

let _parsed = null;
let _headerLine = null;

function hash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function seed(id, salt) {
  return hash(`${id}:${salt}`);
}

const FRESH_RE = /bak|dairy|meat|fish|produce|fruit|veget|seafood|deli/i;
const FATTY_RE = /milk|cream|butter|cheese|yogurt|oil|meat|beef|chicken|pork|lamb/i;
const AISLE_BY_CAT = {
  bakery: 1,
  produce: 2,
  dairy: 3,
  meat: 4,
  fish: 4,
  seafood: 4,
  beverages: 5,
  drinks: 5,
  snacks: 6,
  pantry: 7,
  frozen: 8,
  household: 9,
  cleaning: 9,
  personal: 10,
  beauty: 10,
  baby: 11,
  pet: 12,
};

function aisleFor(p) {
  const text = `${p.category} ${p.subcategory}`.toLowerCase();
  for (const k of Object.keys(AISLE_BY_CAT)) {
    if (text.includes(k)) return AISLE_BY_CAT[k];
  }
  return (seed(p.product_id, "aisle") % 12) + 1;
}

function enrich(p) {
  const id = p.product_id;
  const haystack = `${p.name} ${p.category} ${p.subcategory}`.toLowerCase();
  const fresh = FRESH_RE.test(haystack);

  // Units sold in last 30 days — fresh items move faster.
  const baseSold = fresh ? 120 : 40;
  const units_sold = baseSold + (seed(id, "sold") % (fresh ? 600 : 250));

  // Expiry — fresh items 0.2 – 1.7 days; non-fresh 5 – 90 days.
  const expires_in_days = fresh
    ? Math.round(((seed(id, "exp") % 1500) / 1000 + 0.2) * 10) / 10
    : 5 + (seed(id, "exp") % 85);

  const fat_percentage = FATTY_RE.test(haystack)
    ? Math.round((seed(id, "fat") % 350) / 10) / 10 + 0.5
    : null;

  const aisle = aisleFor(p);
  const shelf = String.fromCharCode(65 + (seed(id, "shelf") % 6));
  const location = `Aisle ${aisle} · Shelf ${shelf}`;

  const stock = parseInt(p.stock_qty, 10) || 0;
  const price = parseFloat(p.price_azn) || 0;

  // Daily sell-through ≈ units_sold / 30. Days of stock left.
  const daily = units_sold / 30;
  const days_of_stock = daily > 0 ? stock / daily : 999;

  let status = "ok";
  if (expires_in_days <= 1.0) status = "expiring";
  else if (days_of_stock < 3) status = "low_stock";
  else if (days_of_stock > 60 && units_sold < 100) status = "overstocked";

  return {
    ...p,
    stock_qty: stock,
    price_azn: price,
    rating: parseFloat(p.rating) || 0,
    units_sold,
    expires_in_days,
    fat_percentage,
    aisle_num: aisle,
    shelf_letter: shelf,
    location,
    is_fresh: fresh,
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
    _parsed.push(enrich(obj));
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
  "azn", "üçün", "var", "ne", "nə", "haqqında", "altı", "üstü",
]);

function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export function findRelevant(query, limit = 30) {
  const products = getProducts();
  const tokens = tokenize(query);

  const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:azn|manat|₼)?/i);
  const priceCap =
    /\b(under|below|less|cheap|altı|aşağı|ucuz)\b/i.test(query) && priceMatch
      ? parseFloat(priceMatch[1])
      : null;

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
  if (top.length === 0) return sample(candidates, limit);
  return top.map((x) => x.p);
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
