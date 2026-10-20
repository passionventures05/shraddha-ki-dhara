import type { CartData } from "@/types";
import { cartItems, cartTotal } from "./cart";
import { inr } from "./format";
import { leadTimeHoursFor, leadTimeText } from "./products";
import { site } from "./site";
import { earliestDelivery, validatePhoneNumber } from "./validation";

export interface OrderForm {
  name: string;
  address: string;
  phone: string;
  orderingForSomeone: "" | "yes" | "no";
  deliveryPhone: string;
  deliveryName: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  sankalpName: string;
  occasion: string;
  deliveryMode: "" | "home-delivery" | "pick-up";
  specialRequest: string;
}

export const emptyOrderForm: OrderForm = {
  name: "", address: "", phone: "", orderingForSomeone: "", deliveryPhone: "", deliveryName: "", deliveryAddress: "",
  deliveryDate: "", deliveryTime: "", sankalpName: "", occasion: "", deliveryMode: "", specialRequest: "",
};

export interface Delivery { phone: string; name: string; address: string }

/** Notice needed for what is in the cart: the longest among its kit categories. */
export const cartLeadTimeHours = (cart: CartData) => leadTimeHoursFor(cartItems(cart).map((i) => i.category));

export const getCartDetails = (cart: CartData) => ({
  total: cartTotal(cart),
  items: cartItems(cart).map((i) => `${i.name} (${i.label}) x ${i.quantity} = ${inr(i.unitPrice * i.quantity)}`),
});

/** Advance to pay now, in rupees (same rounding as the amount quoted in the WhatsApp message). */
export const advanceAmount = (total: number) => Math.round((total * site.advancePercent) / 100);

/** The person who receives the kit (the customer, or someone else when it is a gift). */
export const buildDelivery = (f: OrderForm): Delivery => {
  const someone = f.orderingForSomeone === "yes";
  return {
    phone: someone ? f.deliveryPhone.trim() : f.phone.trim(),
    name: someone ? f.deliveryName.trim() : f.name.trim(),
    address: someone ? f.deliveryAddress.trim() : f.address.trim(),
  };
};

/** Field ids in the order they appear on the form (used to focus the first problem). */
export const ORDER_FIELD_ORDER = [
  "name", "address", "phone", "ordering-for-someone", "delivery-phone", "delivery-name", "delivery-address",
  "delivery-date", "delivery-time", "delivery-mode", "occasion",
] as const;

type Say = (key: string, vars?: Record<string, string>) => string;
const english: Record<string, string> = {
  eName: "Please enter your name.", eAddr: "Please enter your address.", ePhoneReq: "Please enter your phone number.",
  ePhone: "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.",
  eRPhoneReq: "Please enter the recipient's phone number.", eRName: "Please enter the recipient's name.", eRAddr: "Please enter the delivery address.",
  eDate: "Please choose a delivery date.", eTime: "Please choose a delivery time.", eTimeMin: "Please pick a time at least {lead} from now.",
  eMode: "Please choose home delivery or pick up.", eOcc: "Please tell us the occasion.",
};
const fallbackSay: Say = (key, vars = {}) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), english[key] ?? key);

/**
 * Every problem with the form at once, keyed by field id, so each field can show its own message.
 * `say` turns a message key into the visitor's language (defaults to English).
 */
export const getFieldErrors = (f: OrderForm, now: Date = new Date(), leadHours: number = site.leadHours, say: Say = fallbackSay): Record<string, string> => {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e["name"] = say("eName");
  if (!f.address.trim()) e["address"] = say("eAddr");
  if (!f.phone.trim()) e["phone"] = say("ePhoneReq");
  else if (!validatePhoneNumber(f.phone.trim())) e["phone"] = say("ePhone");
  if (f.orderingForSomeone === "yes") {
    if (!f.deliveryPhone.trim()) e["delivery-phone"] = say("eRPhoneReq");
    else if (!validatePhoneNumber(f.deliveryPhone.trim())) e["delivery-phone"] = say("ePhone");
    if (!f.deliveryName.trim()) e["delivery-name"] = say("eRName");
    if (!f.deliveryAddress.trim()) e["delivery-address"] = say("eRAddr");
  }
  if (!f.deliveryDate) e["delivery-date"] = say("eDate");
  if (!f.deliveryTime) e["delivery-time"] = say("eTime");
  if (f.deliveryDate && f.deliveryTime && new Date(`${f.deliveryDate}T${f.deliveryTime}`) < earliestDelivery(now, leadHours))
    e["delivery-time"] = say("eTimeMin", { lead: leadTimeText(leadHours) });
  if (!f.deliveryMode) e["delivery-mode"] = say("eMode");
  if (!f.occasion.trim()) e["occasion"] = say("eOcc");
  return e;
};

/** Single-message safety net. Returns an error message, or null when the order is valid. */
export const validateOrder = (f: OrderForm, delivery: Delivery, now: Date = new Date(), leadHours: number = site.leadHours): string | null => {
  const errors = getFieldErrors(f, now, leadHours);
  if (f.orderingForSomeone === "yes" && (!delivery.phone || !delivery.name || !delivery.address)) return "Please fill in all delivery details (Phone, Name, Address).";
  const first = ORDER_FIELD_ORDER.find((id) => errors[id]);
  return first ? errors[first] : null;
};

/** The order text sent to the shop owner on WhatsApp (always English, so it reads the same every time). */
export const generateWhatsAppMessage = (f: OrderForm, delivery: Delivery, details: { total: number; items: string[] }) => {
  const mode = f.deliveryMode === "home-delivery" ? "🏠 Home Delivery" : "🏪 Pick Up";
  const special = f.specialRequest.trim();
  let m =
    `🪔 *${site.name.toUpperCase()}* 🪔\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📋 *NEW ORDER RECEIVED*\n\n` +
    `👤 *CUSTOMER INFORMATION*\n` +
    `├─ Name: ${f.name.trim()}\n` +
    `├─ Address: ${f.address.trim()}\n` +
    `└─ Phone: +91 ${f.phone.trim()}\n\n`;

  if (f.orderingForSomeone === "yes") {
    m +=
      `👥 *ORDERING FOR SOMEONE ELSE*\n` +
      `🚚 *DELIVERY DETAILS*\n` +
      `├─ Recipient Name: ${delivery.name}\n` +
      `├─ Delivery Address: ${delivery.address}\n` +
      `├─ Contact Number: +91 ${delivery.phone}\n`;
  } else {
    m += `🚚 *DELIVERY DETAILS*\n`;
  }
  m +=
    `├─ Delivery Date: 📅 ${f.deliveryDate}\n` +
    `├─ Delivery Time: 🕐 ${f.deliveryTime}\n` +
    `└─ Delivery Mode: ${mode}\n\n` +
    `🛍️ *ORDER SUMMARY*\n` +
    `${details.items.map((i) => `├─ ${i}`).join("\n")}\n` +
    `└─ *Total Amount: ${inr(details.total)}*\n\n` +
    `🙏 *PUJA DETAILS*\n` +
    `├─ Name for Sankalp: ${f.sankalpName.trim() || "None"}\n` +
    `└─ Occasion: ${f.occasion.trim()}\n\n`;
  if (special) m += `💬 *SPECIAL REQUESTS*\n${special}\n\n`;
  m +=
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *PAYMENT REMINDER*\n` +
    `Please pay ${site.advancePercent}% advance (${inr((details.total * site.advancePercent) / 100)}) to confirm your order.\n\n` +
    `🙏 Thank you for choosing ${site.name}!\n` +
    `Shubh ho aapki puja. 🌼`;
  return m;
};
