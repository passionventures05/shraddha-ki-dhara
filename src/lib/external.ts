import { site } from "./site";

/** Opens WhatsApp with a prefilled message (wa.me link in a new tab; the phone opens the WhatsApp app). */
export function openWhatsApp(message: string) {
  const text = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?phone=${site.whatsapp}&text=${text}`, "_blank", "noopener");
}

/** Opens a non-web link, such as a upi:// payment link. */
export function openExternalUrl(url: string) {
  window.location.href = url;
}

/** True on phones/tablets (where UPI apps can be opened directly). */
export const isMobileDevice = () => typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
