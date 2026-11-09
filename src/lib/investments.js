import { PROFIT_THROUGH_MONTH } from "@/data/investment-sheet";

const amount = (v) => Number(v) || 0;

export function monthsBetween(from, to) {
    const out = [];
    let [y, m] = from.split("-").map(Number);
    const [endY, endM] = to.split("-").map(Number);
    while (y < endY || (y === endY && m <= endM)) {
        out.push(`${y}-${String(m).padStart(2, "0")}`);
        m === 12 ? (y++, m = 1) : m++;
    }
    return out;
}

// A month counts as settled when the amount collected plus its cost reaches the expected profit.
function monthRow(month, entries, record) {
    const expected = entries.filter((e) => e.status === "running" && e.firstProfitMonth <= month).reduce((a, e) => a + amount(e.monthlyProfit), 0);
    const collected = amount(record?.collected);
    const cost = amount(record?.cost);
    const received = collected + cost;
    const due = month <= PROFIT_THROUGH_MONTH;
    const pending = due ? Math.max(0, expected - received) : 0;
    let status = "none";
    if (expected > 0 && received >= expected || expected === 0 && received > 0)
        status = "collected";
    else if (received > 0)
        status = "partial";
    else if (expected > 0)
        status = due ? "pending" : "upcoming";
    return { month, expected, collected, cost, pending, status, note: record?.note ?? "", record };
}

export function investmentAccounts(investments, profits) {
    const names = [...new Set(investments.map((i) => i.name))];
    return names.map((name) => {
        const entries = investments.filter((i) => i.name === name);
        const records = profits.filter((p) => p.account === name);
        const starts = [...entries.map((e) => e.firstProfitMonth), ...records.map((r) => r.month)].filter(Boolean).sort();
        const lastYear = PROFIT_THROUGH_MONTH.slice(0, 4);
        const months = starts.length ? monthsBetween(starts[0], `${lastYear}-12`).map((m) => monthRow(m, entries, records.find((r) => r.month === m))) : [];
        const passed = months.filter((m) => m.month <= PROFIT_THROUGH_MONTH && m.expected > 0);
        return {
            name,
            entries,
            months,
            invested: entries.filter((e) => e.status !== "planned").reduce((a, e) => a + amount(e.amount), 0),
            monthlyProfit: entries.filter((e) => e.status === "running").reduce((a, e) => a + amount(e.monthlyProfit), 0),
            monthsPassed: passed.length,
            monthsCollected: passed.filter((m) => m.status === "collected").length,
            collected: records.reduce((a, r) => a + amount(r.collected), 0),
            cost: records.reduce((a, r) => a + amount(r.cost), 0),
            pending: months.reduce((a, m) => a + m.pending, 0),
        };
    });
}

export const investmentTotals = (accounts) => ({
    invested: accounts.reduce((a, x) => a + x.invested, 0),
    collected: accounts.reduce((a, x) => a + x.collected, 0),
    cost: accounts.reduce((a, x) => a + x.cost, 0),
    pending: accounts.reduce((a, x) => a + x.pending, 0),
});

// Every month with an expected or received profit, across all accounts, up to the current profit month.
export function monthlyProfit(accounts) {
    const all = accounts.flatMap((a) => a.months).filter((m) => m.month <= PROFIT_THROUGH_MONTH && (m.expected > 0 || m.collected > 0));
    return [...new Set(all.map((m) => m.month))].sort().map((month) => ({
        month,
        value: all.filter((m) => m.month === month).reduce((a, m) => a + m.collected, 0),
    }));
}

export const profitRate = (entry) => (amount(entry.amount) > 0 ? (amount(entry.monthlyProfit) / amount(entry.amount)) * 100 : 0);
