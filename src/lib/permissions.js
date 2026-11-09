/**
 * Permissions. Super Admin always has full access. For everyone else, User Permissions decides which pages
 * they see, and Role Actions (DEFAULT_PERMISSIONS is its starting point) decides what their role can do there.
 * This controls the UI only: a future backend must enforce the same rules on the server.
 */
export const ROLES = [
    { key: "super_admin", label: "Super Admin", description: "Full access to everything. Decides what the other roles can do." },
    { key: "admin", label: "Admin (Director)", description: "Runs daily operations, website content and settings." },
    { key: "accountant", label: "Accountant", description: "Records deposits and withdrawals, and updates member details." },
    { key: "viewer", label: "Viewer", description: "Read-only access to operational data." },
];
export const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.key, r.label]));
export const EDITABLE_ROLES = ROLES.filter((r) => r.key !== "super_admin");

export const ACTIONS = ["view", "create", "update", "delete"];
export const ACTION_LABEL = { view: "View", create: "Create", update: "Edit", delete: "Delete" };

const CRUD = ACTIONS;
const NO_DELETE = ["view", "create", "update"]; // Financial records are never deletable.
const VIEW = ["view"];

// The admin's page list: `key` is also the page's URL. `superOnly` pages can never be given to another role.
export const MODULES = [
    { key: "dashboard", label: "Dashboard", group: "Overview", actions: VIEW },
    { key: "members", label: "Members", group: "Finance", actions: CRUD },
    { key: "payments", label: "Monthly Deposits", group: "Finance", actions: NO_DELETE },
    { key: "dues", label: "Dues", group: "Finance", actions: VIEW },
    { key: "investments", label: "Investments", group: "Finance", actions: CRUD },
    { key: "projects", label: "Projects", group: "Finance", actions: CRUD },
    { key: "profits", label: "Profit & Costs", group: "Finance", actions: NO_DELETE },
    { key: "withdrawals", label: "Withdrawals", group: "Finance", actions: NO_DELETE },
    { key: "page-names", label: "Page Names", group: "Website", actions: CRUD },
    { key: "page-sections", label: "Page Sections", group: "Website", actions: CRUD },
    { key: "faqs", label: "FAQ Content", group: "Website", actions: CRUD },
    { key: "notices", label: "Notices", group: "Website", actions: CRUD },
    { key: "messages", label: "Message Inbox", group: "Website", actions: CRUD },
    { key: "users", label: "Users", group: "Administration", actions: CRUD, superOnly: true },
    { key: "user-permissions", label: "User Permissions", group: "Administration", actions: CRUD, superOnly: true },
    { key: "roles", label: "Role Actions", group: "Administration", actions: VIEW, superOnly: true },
    { key: "audit", label: "Audit Log", group: "Administration", actions: VIEW },
    { key: "settings", label: "Settings", group: "Administration", actions: ["view", "update"] },
];
const moduleOf = Object.fromEntries(MODULES.map((m) => [m.key, m]));

const READ_ONLY = {
    dashboard: VIEW, members: VIEW, payments: VIEW, dues: VIEW, investments: VIEW, projects: VIEW, profits: VIEW, withdrawals: VIEW,
    "page-names": VIEW, "page-sections": VIEW, faqs: VIEW, notices: VIEW, messages: VIEW, audit: VIEW,
};
export const DEFAULT_PERMISSIONS = {
    admin: {
        ...READ_ONLY,
        members: CRUD, payments: NO_DELETE, investments: CRUD, projects: CRUD, profits: NO_DELETE, withdrawals: NO_DELETE,
        "page-names": CRUD, "page-sections": CRUD, faqs: CRUD, notices: CRUD,
        messages: ["view", "update", "delete"],
        settings: ["view", "update"],
    },
    accountant: { ...READ_ONLY, members: ["view", "update"], payments: NO_DELETE, profits: NO_DELETE, withdrawals: NO_DELETE },
    viewer: READ_ONLY,
};

// Pages come from the user's own active permission row; create, edit and delete also need the user's role to allow them.
export function userCan({ role, userId, permissions, userPermissions }, moduleKey, action = "view") {
    const mod = moduleOf[moduleKey];
    if (!mod || !mod.actions.includes(action))
        return false;
    if (role === "super_admin")
        return true;
    if (mod.superOnly)
        return false;
    const row = userPermissions?.find((p) => p.userId === userId && p.status === "active");
    if (!row?.pages.includes(moduleKey))
        return false;
    return action === "view" || !!permissions?.[role]?.[moduleKey]?.includes(action);
}
