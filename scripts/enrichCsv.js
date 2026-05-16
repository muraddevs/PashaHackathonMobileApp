// Adds derived/static columns to bravo_dataset.csv:
//   units_sold (30-day), expires_in_days, is_fresh, fat_percentage,
//   aisle_num, shelf_letter, location
// Values are deterministic from product_id so re-runs are stable.

const fs = require("fs");
const path = require("path");

function hash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}
const seed = (id, salt) => hash(`${id}:${salt}`);

const FRESH_RE = /bak|dairy|meat|fish|produce|fruit|veget|seafood|deli/i;
const FATTY_RE =
  /milk|cream|butter|cheese|yogurt|oil|meat|beef|chicken|pork|lamb|sausage/i;

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

function aisleFor(category, subcategory, id) {
  const t = `${category} ${subcategory}`.toLowerCase();
  for (const k of Object.keys(AISLE_BY_CAT)) {
    if (t.includes(k)) return AISLE_BY_CAT[k];
  }
  return (seed(id, "aisle") % 12) + 1;
}

const SRC = path.join(__dirname, "..", "assets", "bravo_dataset.csv");
const OUT_CSV = SRC; // overwrite in place
const OUT_JS = path.join(__dirname, "..", "src", "data", "products.js");

// RFC-4180-ish parser that handles "quoted, fields, with commas".
function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
      } else {
        cur += ch;
      }
    } else if (ch === ',') {
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

function csvCell(v) {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const text = fs.readFileSync(SRC, "utf8").replace(/\r/g, "");
const lines = text.trim().split("\n");
const oldHeader = parseCSVLine(lines[0]);

// Drop any of our derived columns if a prior run added them, so we always
// regenerate from the original 11 source columns.
const DERIVED = new Set([
  "units_sold",
  "expires_in_days",
  "is_fresh",
  "fat_percentage",
  "aisle_num",
  "shelf_letter",
  "location",
]);

const keepIdx = oldHeader
  .map((h, i) => (DERIVED.has(h) ? -1 : i))
  .filter((i) => i !== -1);
const baseHeader = keepIdx.map((i) => oldHeader[i]);
const newHeader = [
  ...baseHeader,
  "units_sold",
  "expires_in_days",
  "is_fresh",
  "fat_percentage",
  "aisle_num",
  "shelf_letter",
  "location",
];

const out = [newHeader.map(csvCell).join(",")];
let freshCount = 0;
let fattyCount = 0;
for (let li = 1; li < lines.length; li++) {
  const cols = parseCSVLine(lines[li]);
  const row = {};
  oldHeader.forEach((h, i) => (row[h] = cols[i]));

  const id = row.product_id;
  const cat = row.category || "";
  const sub = row.subcategory || "";
  const name = row.name || "";
  const haystack = `${name} ${cat} ${sub}`.toLowerCase();

  const fresh = FRESH_RE.test(haystack);
  if (fresh) freshCount++;

  const baseSold = fresh ? 120 : 40;
  const units_sold = baseSold + (seed(id, "sold") % (fresh ? 600 : 250));

  const expires_in_days = fresh
    ? Math.round(((seed(id, "exp") % 1500) / 1000 + 0.2) * 10) / 10
    : 5 + (seed(id, "exp") % 85);

  const fatty = FATTY_RE.test(haystack);
  if (fatty) fattyCount++;
  const fat_percentage = fatty
    ? Math.round((seed(id, "fat") % 350) / 10) / 10 + 0.5
    : "";

  const aisle_num = aisleFor(cat, sub, id);
  const shelf_letter = String.fromCharCode(65 + (seed(id, "shelf") % 6));
  const location = `Aisle ${aisle_num} · Shelf ${shelf_letter}`;

  const baseValues = keepIdx.map((i) => cols[i]);
  out.push(
    [
      ...baseValues,
      units_sold,
      expires_in_days,
      fresh ? "true" : "false",
      fat_percentage,
      aisle_num,
      shelf_letter,
      location,
    ]
      .map(csvCell)
      .join(",")
  );
}

const newCsv = out.join("\n") + "\n";
fs.writeFileSync(OUT_CSV, newCsv);

// Regenerate src/data/products.js with the enriched CSV as a template literal.
const escaped = newCsv
  .replace(/\\/g, "\\\\")
  .replace(/\$/g, "\\$")
  .replace(/`/g, "\\`");
fs.writeFileSync(OUT_JS, `export const PRODUCTS_CSV = \`${escaped}\`;\n`);

console.log("Wrote", OUT_CSV);
console.log("Wrote", OUT_JS);
console.log(
  `Rows: ${lines.length - 1}, fresh: ${freshCount}, fatty: ${fattyCount}, columns: ${newHeader.length}`
);
