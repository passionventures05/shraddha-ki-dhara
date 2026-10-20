// Content rules: validation + conversion of CMS files (content/) into the data the website reads (src/generated/).
// Plain ESM (no dependencies) so it runs before the Next.js build and inside tests.
import fs from "node:fs";
import path from "node:path";

const catFile = JSON.parse(fs.readFileSync(new URL("../src/lib/categories.json", import.meta.url), "utf8"));
/** Single source: src/lib/categories.json. The CMS form (public/admin/config.yml) must list the same categories. */
export const CATEGORIES = catFile.categories.map((c) => c.id);
export const DEFAULT_DESCRIPTION = "A complete, thoughtfully packed puja kit.";
const MAX_IMAGE_BYTES = 1_500_000;

const str = (v) => String(v ?? "").trim();
const toList = (v) => (Array.isArray(v) ? v : str(v).split(",")).map((s) => str(s)).filter(Boolean);

/** Checks a photo path chosen in the CMS. Returns the path if the file exists. */
function checkImage(rel, { file, publicDir, errors, warnings }) {
  if (!rel) return undefined;
  rel = str(rel);
  if (!rel.startsWith("/")) {
    errors.push(`${file}: photo path "${rel}" must start with "/"`);
    return undefined;
  }
  const full = path.join(publicDir, rel);
  if (!fs.existsSync(full)) {
    warnings.push(`${file}: photo ${rel} was not found, the default picture will be shown`);
    return undefined;
  }
  if (fs.statSync(full).size > MAX_IMAGE_BYTES)
    warnings.push(`${file}: photo ${rel} is over 1.5 MB, please upload a smaller one (it slows the site down)`);
  return rel;
}

/** Validates one CMS product (puja kit). Returns { product, available, order, errors, warnings }. */
export function validateProduct(raw, { file = "product", publicDir = "public", id = "" } = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(`${file}: ${m}`);

  const name = str(raw?.name);
  if (!name) err("the kit needs a name");

  const category = CATEGORIES.find((c) => c.toLowerCase() === str(raw?.category).toLowerCase());
  if (!category) err(`category "${raw?.category ?? ""}" is not one of the allowed categories`);

  const prices = [raw?.priceBasic, raw?.priceStandard, raw?.pricePremium].map(Number);
  ["Basic", "Standard", "Premium"].forEach((t, i) => {
    if (!Number.isFinite(prices[i]) || prices[i] <= 0) err(`the ${t} price must be a number above 0`);
  });
  if (prices.every((p) => p > 0) && !(prices[0] <= prices[1] && prices[1] <= prices[2]))
    warnings.push(`${file}: prices usually go up from Basic to Standard to Premium, please double-check them`);

  const contents = toList(raw?.contents);
  if (contents.length === 0) warnings.push(`${file}: no items are listed under "What's in the kit"`);
  const contentsHi = toList(raw?.contentsHi);

  const image = checkImage(raw?.image, { file, publicDir, errors, warnings });

  let order;
  if (raw?.order !== undefined && raw?.order !== null && raw?.order !== "") {
    order = Number(raw.order);
    if (!Number.isFinite(order)) err("the list position must be a number");
  }

  const product = {
    id: id || str(file).replace(/\.json$/, ""),
    name,
    nameHi: str(raw?.nameHi) || name,
    category: category ?? "",
    prices: prices.map((p) => (Number.isFinite(p) ? Math.round(p) : 0)),
    contents,
    contentsHi: contentsHi.length ? contentsHi : contents,
    description: str(raw?.description) || DEFAULT_DESCRIPTION,
    descriptionHi: str(raw?.descriptionHi) || str(raw?.description) || DEFAULT_DESCRIPTION,
    ...(image ? { image } : {}),
  };
  return { product, available: raw?.available !== false, order, errors, warnings };
}

/** Reads every content/products/*.json, validates, sorts. Returns { catalogue, errors, warnings, fileCount }. */
export function buildCatalogue(contentDir = "content/products", publicDir = "public") {
  const errors = [];
  const warnings = [];
  const items = [];
  const files = fs.existsSync(contentDir) ? fs.readdirSync(contentDir).filter((f) => f.endsWith(".json")).sort() : [];

  for (const f of files) {
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(contentDir, f), "utf8"));
    } catch (e) {
      errors.push(`${f}: not valid JSON (${e.message})`);
      continue;
    }
    const r = validateProduct(raw, { file: f, publicDir });
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    if (r.errors.length === 0 && r.available) items.push(r);
  }

  const seen = new Set();
  for (const it of items) {
    const key = it.product.name.toLowerCase();
    if (seen.has(key)) errors.push(`two kits are both called "${it.product.name}"; names must be different`);
    seen.add(key);
  }

  items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.product.name.localeCompare(b.product.name));
  return { catalogue: items.map((i) => i.product), errors, warnings, fileCount: files.length };
}

const readJson = (file, errors) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") errors.push(`${path.basename(file)}: not valid JSON (${e.message})`);
    return null;
  }
};

export const DEFAULT_SETTINGS = {
  whatsapp: "919999999999",
  phoneDisplay: "",
  upi: "yourname@upi",
  email: "hello@shraddhakidhara.com",
  youtube: "https://www.youtube.com/@shraddhakidhara",
  leadHours: 36,
  advancePercent: 50,
  deliveryPincodes: [],
};

/**
 * Builds everything in content/settings (site details, add-ons, videos, reviews, mantras, festivals, gallery).
 * Returns { content, errors, warnings }.
 */
export function buildContent(settingsDir = "content/settings", publicDir = "public") {
  const errors = [];
  const warnings = [];
  const list = (name) => {
    const j = readJson(path.join(settingsDir, name), errors);
    return Array.isArray(j?.items) ? j.items : [];
  };

  // --- site details
  const rawSite = readJson(path.join(settingsDir, "site.json"), errors) ?? {};
  const settings = { ...DEFAULT_SETTINGS };
  const whatsapp = str(rawSite.whatsapp).replace(/\D/g, "");
  if (rawSite.whatsapp !== undefined) {
    if (whatsapp.length < 11 || whatsapp.length > 15) errors.push("site.json: the WhatsApp number must include the country code (e.g. 919876543210)");
    else settings.whatsapp = whatsapp;
  }
  if (settings.whatsapp === DEFAULT_SETTINGS.whatsapp) warnings.push("site.json: the WhatsApp number is still the placeholder, set your real one in the CMS (Site details)");
  if (rawSite.upi !== undefined) {
    if (!/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(str(rawSite.upi))) errors.push("site.json: the UPI ID looks wrong (it should look like name@bank)");
    else settings.upi = str(rawSite.upi);
  }
  if (settings.upi === DEFAULT_SETTINGS.upi) warnings.push("site.json: the UPI ID is still the placeholder, set your real one in the CMS (Site details)");
  for (const k of ["phoneDisplay", "email", "youtube"]) if (rawSite[k] !== undefined) settings[k] = str(rawSite[k]);
  if (rawSite.leadHours !== undefined) {
    const n = Number(rawSite.leadHours);
    if (!Number.isFinite(n) || n < 0 || n > 720) errors.push("site.json: notice hours must be a number between 0 and 720");
    else settings.leadHours = n;
  }
  if (rawSite.advancePercent !== undefined) {
    const n = Number(rawSite.advancePercent);
    if (!Number.isFinite(n) || n < 0 || n > 100) errors.push("site.json: the advance percentage must be between 0 and 100");
    else settings.advancePercent = n;
  }
  if (rawSite.deliveryPincodes !== undefined) {
    const pins = toList(rawSite.deliveryPincodes);
    const bad = pins.filter((p) => !/^\d{6}$/.test(p));
    if (bad.length) errors.push(`site.json: these pincodes are not 6 digits: ${bad.join(", ")}`);
    else settings.deliveryPincodes = pins;
  }

  // --- add-ons
  const addons = list("addons.json").map((a, i) => {
    const price = Number(a?.price);
    if (!str(a?.name)) errors.push(`addons.json: add-on #${i + 1} needs a name`);
    if (!Number.isFinite(price) || price <= 0) errors.push(`addons.json: "${str(a?.name)}" needs a price above 0`);
    return { id: `addon-${i + 1}`, en: str(a?.name), hi: str(a?.nameHi) || str(a?.name), price: Math.round(price) || 0 };
  });

  // --- videos
  const videos = list("videos.json").map((v, i) => {
    if (!str(v?.title)) errors.push(`videos.json: video #${i + 1} needs a title`);
    if (!/^https?:\/\//.test(str(v?.url))) errors.push(`videos.json: "${str(v?.title)}" needs a full link starting with https://`);
    else if (/VIDEO_ID/.test(str(v.url))) warnings.push(`videos.json: "${str(v.title)}" still has a placeholder link`);
    const thumb = checkImage(v?.thumb, { file: "videos.json", publicDir, errors, warnings });
    return { title: str(v?.title), titleHi: str(v?.titleHi) || str(v?.title), url: str(v?.url), ...(thumb ? { thumb } : {}) };
  });

  // --- reviews
  const reviews = list("reviews.json").map((r, i) => {
    if (!str(r?.name) || !str(r?.text)) errors.push(`reviews.json: review #${i + 1} needs a name and the review text`);
    return { name: str(r?.name), nameHi: str(r?.nameHi) || str(r?.name), text: str(r?.text), textHi: str(r?.textHi) || str(r?.text) };
  });

  // --- daily mantras
  const mantras = list("mantras.json").map((m, i) => {
    if (!str(m?.sanskrit)) errors.push(`mantras.json: mantra #${i + 1} needs the Sanskrit text`);
    return { sanskrit: str(m?.sanskrit), en: str(m?.meaning), hi: str(m?.meaningHi) || str(m?.meaning) };
  });

  // --- festivals (countdown)
  const festivals = list("festivals.json").map((f, i) => {
    const date = str(f?.date).slice(0, 10);
    if (!str(f?.name)) errors.push(`festivals.json: festival #${i + 1} needs a name`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) errors.push(`festivals.json: "${str(f?.name)}" needs a valid date`);
    return { name: str(f?.name), nameHi: str(f?.nameHi) || str(f?.name), date, category: str(f?.category) };
  });

  // --- gallery
  const gallery = list("gallery.json")
    .map((g) => {
      const image = checkImage(g?.image, { file: "gallery.json", publicDir, errors, warnings });
      return image ? { image, caption: str(g?.caption), captionHi: str(g?.captionHi) || str(g?.caption) } : null;
    })
    .filter(Boolean);

  return { content: { settings, addons, videos, reviews, mantras, festivals, gallery }, errors, warnings };
}
