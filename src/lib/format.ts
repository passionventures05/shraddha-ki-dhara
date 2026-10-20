const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 1049 -> "₹1,049" */
export const inr = (amount: number) => `₹${fmt.format(Math.round(amount))}`;
