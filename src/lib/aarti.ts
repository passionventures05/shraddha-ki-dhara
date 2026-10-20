/** Early morning and dusk are traditional aarti hours; the site takes on a warmer glow then. */
export type AartiPhase = "morning" | "evening" | "";
export const aartiPhase = (d: Date = new Date()): AartiPhase => {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 8) return "morning";
  if (h >= 17.5 && h < 20) return "evening";
  return "";
};

/** Day of the year (1-366) in local time, used to rotate the mantra of the day. */
export const dayOfYear = (d: Date = new Date()) =>
  Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
