export const num = (n) => Number(n).toLocaleString("en-US");
// A non-breaking space keeps the symbol and the amount on one line.
export const taka = (n) => (n < 0 ? "-" : "") + "৳ " + num(Math.abs(n));
export const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "-";
export const formatDateTime = (d) => new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
// "2026-11" -> "Nov" / "Nov 2026"
const monthDate = (ym) => new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1, 1);
export const monthShort = (ym) => monthDate(ym).toLocaleDateString("en-GB", { month: "short" });
export const monthYearShort = (ym) => monthDate(ym).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
export const monthLong = (ym) => monthDate(ym).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
export const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8);
