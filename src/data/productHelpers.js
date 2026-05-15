import { PRODUCTS_CSV } from "./products";

let _parsed = null;
let _headerLine = null;

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
    _parsed.push(obj);
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
  "azn", "üçün", "var", "var?", "ne", "nə", "haqqında", "altı", "üstü",
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
    candidates = candidates.filter((p) => parseFloat(p.price_azn) <= priceCap);
  }

  if (tokens.length === 0) {
    // No keywords — return cheapest matches if price filter, else a small sample
    return (priceCap != null ? candidates : sample(candidates, limit * 3))
      .slice(0, limit);
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
