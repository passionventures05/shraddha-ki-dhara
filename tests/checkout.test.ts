import { describe, expect, it } from "vitest";
import type { CartData } from "@/types";
import { cartItemCount, cartTotal } from "@/lib/cart";
import { kitLabel, kitPrice, leadTimeHoursFor, leadTimeText, kits, addons } from "@/lib/products";
import { site } from "@/lib/site";
import { advanceAmount, buildDelivery, emptyOrderForm, generateWhatsAppMessage, getCartDetails, getFieldErrors, validateOrder, type OrderForm } from "@/lib/order";
import { earliestDelivery, validatePhoneNumber } from "@/lib/validation";
import { inr } from "@/lib/format";

const now = new Date("2026-10-19T10:00:00");
const ok: OrderForm = { ...emptyOrderForm, name: "Asha", phone: "9876543210", address: "12 MG Road", orderingForSomeone: "no", deliveryDate: "2026-10-25", deliveryTime: "10:00", deliveryMode: "home-delivery", occasion: "Griha Pravesh" };
const cart: CartData = {
  "a|1|": { key: "a|1|", name: "Ganesh Puja Kit", nameHi: "गणेश पूजा किट", label: "Standard", unitPrice: 899, quantity: 2, category: "Ganesh" },
  "b|0|": { key: "b|0|", name: "Lakshmi Puja Kit", nameHi: "लक्ष्मी पूजा किट", label: "Basic", unitPrice: 599, quantity: 1, category: "Lakshmi" },
};

describe("cart maths", () => {
  it("counts and totals", () => { expect(cartItemCount(cart)).toBe(3); expect(cartTotal(cart)).toBe(2397); });
  it("formats rupees", () => expect(inr(1049)).toBe("₹1,049"));
  it("prices a kit by tier and add-ons", () => {
    const k = kits[0];
    expect(kitPrice(k, 1)).toBe(k.prices[1]);
    if (addons[0]) { expect(kitPrice(k, 0, [addons[0].id])).toBe(k.prices[0] + addons[0].price); expect(kitLabel(0, [addons[0].id])).toBe(`Basic + ${addons[0].en}`); }
  });
  it("advance is the configured share of the total", () => expect(advanceAmount(2000)).toBe(Math.round((2000 * site.advancePercent) / 100)));
});

describe("phone and notice time", () => {
  it("validates Indian mobiles", () => { expect(validatePhoneNumber("9876543210")).toBe(true); expect(validatePhoneNumber("1234567890")).toBe(false); expect(validatePhoneNumber("98765")).toBe(false); });
  it("earliest delivery is now plus the notice", () => expect(earliestDelivery(now, 36).getTime() - now.getTime()).toBe(36 * 3600e3));
  it("notice is never below the site default and reads naturally", () => {
    expect(leadTimeHoursFor(["Ganesh"])).toBeGreaterThanOrEqual(site.leadHours);
    expect(leadTimeText(36)).toBe("36 hours"); expect(leadTimeText(72)).toBe("3 days"); expect(leadTimeText(72, "hi")).toBe("3 दिन");
  });
});

describe("order form", () => {
  it("a good order has no errors", () => { expect(getFieldErrors(ok, now, 36)).toEqual({}); expect(validateOrder(ok, buildDelivery(ok), now, 36)).toBeNull(); });
  it("reports every missing field at once", () => {
    const e = getFieldErrors({ ...emptyOrderForm, orderingForSomeone: "no" }, now, 36);
    for (const id of ["name", "address", "phone", "delivery-date", "delivery-time", "delivery-mode", "occasion"]) expect(e[id]).toBeTruthy();
  });
  it("rejects a delivery time that is too soon", () => {
    const e = getFieldErrors({ ...ok, deliveryDate: "2026-10-19", deliveryTime: "12:00" }, now, 36);
    expect(e["delivery-time"]).toContain("36 hours");
  });
  it("gift orders need the recipient's details", () => {
    const e = getFieldErrors({ ...ok, orderingForSomeone: "yes" }, now, 36);
    expect(Object.keys(e)).toEqual(expect.arrayContaining(["delivery-phone", "delivery-name", "delivery-address"]));
    const f = { ...ok, orderingForSomeone: "yes" as const, deliveryName: "Ravi", deliveryPhone: "9123456780", deliveryAddress: "5 Park St" };
    expect(buildDelivery(f)).toEqual({ name: "Ravi", phone: "9123456780", address: "5 Park St" });
    expect(getFieldErrors(f, now, 36)).toEqual({});
  });
  it("can show messages in another language", () => {
    expect(getFieldErrors({ ...ok, name: "" }, now, 36, () => "नाम")["name"]).toBe("नाम");
  });
});

describe("WhatsApp order message", () => {
  const msg = generateWhatsAppMessage({ ...ok, sankalpName: "Sharma family", specialRequest: "Extra incense" }, buildDelivery(ok), getCartDetails(cart));
  it("contains customer, delivery, items, total and puja details", () => {
    for (const s of [site.name.toUpperCase(), "Asha", "+91 9876543210", "2026-10-25", "Home Delivery", "Ganesh Puja Kit (Standard) x 2", "Total Amount: ₹2,397", "Sharma family", "Griha Pravesh", "Extra incense"]) expect(msg).toContain(s);
  });
  it("states the advance to pay", () => expect(msg).toContain(`${site.advancePercent}% advance`));
  it("shows gift details when ordering for someone else", () => {
    const f = { ...ok, orderingForSomeone: "yes" as const, deliveryName: "Ravi", deliveryPhone: "9123456780", deliveryAddress: "5 Park St" };
    expect(generateWhatsAppMessage(f, buildDelivery(f), getCartDetails(cart))).toContain("ORDERING FOR SOMEONE ELSE");
  });
});
