import { site } from "./site";

/** 10-digit Indian mobile number starting with 6-9 */
export const validatePhoneNumber = (phone: string) => /^[6-9]\d{9}$/.test(phone);

export const digitsOnly = (v: string) => v.replace(/[^0-9]/g, "");

const pad = (n: number) => String(n).padStart(2, "0");
export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Earliest allowed delivery moment (now + notice time). */
export const earliestDelivery = (now: Date = new Date(), leadHours: number = site.leadHours) =>
  new Date(now.getTime() + leadHours * 60 * 60 * 1000);
