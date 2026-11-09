import { COLLECTION_SHEETS, LAST_COLLECTION_MONTH, MEMBERS, MONTHLY_AMOUNT } from "@/data/collection";
import { INVESTMENTS, PROFIT_RECORDS } from "@/data/investment-sheet";
import { PROJECTS } from "@/data/projects";
import { USER_PERMISSIONS } from "@/data/user-permissions";
import { websiteFaqs, websitePageNames, websiteSections } from "@/data/website";
import { DEFAULT_PERMISSIONS } from "./permissions";

const paidDate = (month, cell) => typeof cell === "number" ? `${month}-${String(cell).padStart(2, "0")}` : cell;
const payments = MEMBERS.flatMap((m) => COLLECTION_SHEETS.flatMap((sheet) => sheet.months.flatMap((month, i) => {
    const cell = m.collections[sheet.year][i];
    if (cell === null || month > LAST_COLLECTION_MONTH)
        return [];
    return [{ id: `p${m.sl}-${month}`, member: m.name, month, amount: MONTHLY_AMOUNT, paidDate: paidDate(month, cell), status: "verified" }];
}))).sort((a, b) => b.month.localeCompare(a.month));

export const seed = {
    members: MEMBERS.map((m) => ({ id: "m" + m.sl, sl: m.sl, name: m.name, phone: m.mobile, status: "active", monthly: MONTHLY_AMOUNT })),
    payments,
    investments: INVESTMENTS,
    projects: PROJECTS,
    profits: PROFIT_RECORDS,
    withdrawals: [],
    notices: [
        { id: "n1", title: "November deposit deadline is the 10th", body: "Please make your deposit on time.", date: "2026-11-01", published: "yes" },
        { id: "n2", title: "Annual General Meeting", body: "The meeting will be held on 15 December.", date: "2026-10-20", published: "yes" },
    ],
    messages: [
        { id: "c1", name: "Abu Sayeed", phone: "01811000001", message: "I would like to become a member. How do I apply?", date: "2026-11-03", status: "new" },
        { id: "c2", name: "Mina Kumari", phone: "01911000002", message: "I would like to know more about the investment projects.", date: "2026-11-02", status: "read" },
    ],
    pageNames: websitePageNames,
    pageSections: websiteSections,
    faqs: websiteFaqs,
    permissions: DEFAULT_PERMISSIONS,
    userPermissions: USER_PERMISSIONS,
    users: [
        { id: "u1", name: "Super Admin", email: "super@bondhu.test", role: "super_admin", status: "active" },
        { id: "u2", name: "Director", email: "admin@bondhu.test", role: "admin", status: "active" },
        { id: "u3", name: "Accountant", email: "accountant@bondhu.test", role: "accountant", status: "active" },
        { id: "u4", name: "Viewer", email: "viewer@bondhu.test", role: "viewer", status: "active" },
    ],
    settings: { orgName: "Bondhu Sanchay Parishad", about: "A community-based savings and joint investment platform.", monthlyAmount: MONTHLY_AMOUNT, dueDay: 10, fine: 20, phone: "01700000000" },
};
// Demo only: real passwords will not live in the frontend; the backend will verify them with Argon2/bcrypt.
export const DEMO_PASSWORD = "Demo@12345";
