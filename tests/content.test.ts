import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-ignore plain ESM script without types
import { CATEGORIES, buildCatalogue, buildContent, validateProduct } from "../scripts/content-lib.mjs";

const good = { name: "Ganesh Puja Kit", category: "Ganesh", priceBasic: 499, priceStandard: 899, pricePremium: 1499, contents: ["Roli"], available: true, order: 10 };

describe("validateProduct", () => {
  it("accepts a complete kit and fills Hindi/description fallbacks", () => {
    const r = validateProduct(good, { file: "ganesh.json", publicDir: "public" });
    expect(r.errors).toEqual([]);
    expect(r.product.id).toBe("ganesh");
    expect(r.product.prices).toEqual([499, 899, 1499]);
    expect(r.product.nameHi).toBe("Ganesh Puja Kit");
    expect(r.product.contentsHi).toEqual(["Roli"]);
  });
  it("rejects a missing name, bad category and bad prices", () => {
    const r = validateProduct({ ...good, name: "", category: "Nope", priceBasic: 0, pricePremium: "abc" }, { file: "x.json" });
    expect(r.errors.length).toBeGreaterThanOrEqual(4);
  });
  it("warns when prices go down, and when a photo is missing", () => {
    const r = validateProduct({ ...good, priceBasic: 2000, image: "/uploads/products/missing.jpg" }, { file: "x.json", publicDir: "public" });
    expect(r.errors).toEqual([]);
    expect(r.warnings.length).toBe(2);
    expect(r.product.image).toBeUndefined();
  });
  it("honours available:false", () => {
    expect(validateProduct({ ...good, available: false }, { file: "x.json" }).available).toBe(false);
  });
});

describe("the real content", () => {
  it("every kit in content/products is valid, unique and sorted", () => {
    const r = buildCatalogue("content/products", "public");
    expect(r.errors).toEqual([]);
    expect(r.catalogue.length).toBeGreaterThan(0);
    const names = r.catalogue.map((p: { name: string }) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
  it("site settings, add-ons, mantras and festivals are valid", () => {
    const r = buildContent("content/settings", "public");
    expect(r.errors).toEqual([]);
    expect(r.content.mantras.length).toBeGreaterThan(0);
    expect(r.content.settings.advancePercent).toBeGreaterThanOrEqual(0);
  });
  it("the CMS form (config.yml) offers exactly the categories the site knows", () => {
    const yml = fs.readFileSync("public/admin/config.yml", "utf8");
    const block = yml.slice(yml.indexOf("name: category"), yml.indexOf("- label: Basic price"));
    const options = [...block.matchAll(/^\s+- "(.+)"$/gm)].map((m) => m[1]);
    expect(options).toEqual(CATEGORIES);
  });
});

describe("buildContent problems are caught", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sd-"));
  const write = (n: string, o: unknown) => fs.writeFileSync(path.join(dir, n), JSON.stringify(o));
  it("flags bad WhatsApp, UPI, percentage, pincode and festival date", () => {
    write("site.json", { whatsapp: "123", upi: "nope", advancePercent: 150, deliveryPincodes: ["12345"] });
    write("festivals.json", { items: [{ name: "X", date: "not-a-date" }] });
    const r = buildContent(dir, "public");
    expect(r.errors.length).toBeGreaterThanOrEqual(5);
  });
  it("accepts good values", () => {
    write("site.json", { whatsapp: "+91 98765 43210", upi: "name@okicici", leadHours: 24, advancePercent: 30, deliveryPincodes: ["560001"] });
    write("festivals.json", { items: [{ name: "Diwali", date: "2026-11-08" }] });
    const r = buildContent(dir, "public");
    expect(r.errors).toEqual([]);
    expect(r.content.settings.whatsapp).toBe("919876543210");
    expect(r.content.settings.deliveryPincodes).toEqual(["560001"]);
  });
});
