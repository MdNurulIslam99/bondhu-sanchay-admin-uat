/**
 * Static starting data: which pages each user can see after logging in.
 * When the API is ready, load these rows from it instead. Super Admin users need no row: they see every page.
 * Page keys are the `key` values of MODULES in lib/permissions.js.
 */
const FINANCE = ["members", "payments", "dues", "investments", "projects", "profits", "withdrawals"];
const WEBSITE = ["page-names", "page-sections", "faqs", "notices", "messages"];

export const USER_PERMISSIONS = [
    { id: "up-u2", userId: "u2", status: "active", pages: ["dashboard", ...FINANCE, ...WEBSITE, "audit", "settings"] },
    { id: "up-u3", userId: "u3", status: "active", pages: ["dashboard", ...FINANCE, ...WEBSITE, "audit"] },
    { id: "up-u4", userId: "u4", status: "active", pages: ["dashboard", ...FINANCE, ...WEBSITE, "audit"] },
];
