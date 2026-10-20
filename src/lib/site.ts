import { settings } from "./content";

/**
 * Business details. Name, tagline and links live here; the things the owner changes often
 * (WhatsApp, UPI, notice hours, advance %, pincodes) come from the CMS: "Website Content → Site details".
 */
export const site = {
  name: "Shraddha Ki Dhara",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://shraddhakidhara.com", // CHANGE ME to your live domain (used for link previews)
  city: "India",

  whatsapp: settings.whatsapp,
  phoneDisplay: settings.phoneDisplay || `+${settings.whatsapp}`,
  upi: settings.upi,
  email: settings.email,
  youtube: settings.youtube,

  /** Fallback minimum notice for delivery / pick-up, in hours. */
  leadHours: settings.leadHours,
  /** Share of the total to be paid in advance to confirm an order. */
  advancePercent: settings.advancePercent,
  /**
   * Pincodes you deliver to. While this list is empty the delivery checker simply asks the
   * customer to confirm their area with you on WhatsApp.
   */
  deliveryPincodes: settings.deliveryPincodes as readonly string[],
};

export const whatsappChatUrl = `https://wa.me/${site.whatsapp}`;
