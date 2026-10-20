// Turns content/ (edited in the CMS) into src/generated/*.json (read by the website).
// Fails with a plain-language message if anything is wrong, so a bad edit never reaches the live site.
import fs from "node:fs";
import { buildCatalogue, buildContent } from "./content-lib.mjs";

const cat = buildCatalogue("content/products", "public");
const con = buildContent("content/settings", "public");
const errors = [...cat.errors, ...con.errors];
const warnings = [...cat.warnings, ...con.warnings];

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  console.error("\n✖ The content has problems:\n");
  for (const e of errors) console.error("  - " + e);
  console.error("\nFix these in the CMS (or the file) and save again.\n");
  process.exit(1);
}
if (cat.catalogue.length === 0) {
  console.error("✖ No puja kits found in content/products");
  process.exit(1);
}
fs.mkdirSync("src/generated", { recursive: true });
fs.writeFileSync("src/generated/catalogue.json", JSON.stringify(cat.catalogue, null, 2) + "\n");
fs.writeFileSync("src/generated/content.json", JSON.stringify(con.content, null, 2) + "\n");
console.log(`✓ ${cat.catalogue.length} kits published (${cat.fileCount - cat.catalogue.length} hidden) -> src/generated/catalogue.json`);
console.log("✓ site details, add-ons, videos, reviews, mantras, festivals and gallery -> src/generated/content.json");
