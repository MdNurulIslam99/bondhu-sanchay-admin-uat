import { COLLECTION_SHEETS, LAST_COLLECTION_MONTH } from "@/data/collection";
import { monthYearShort } from "./format";

export const COLLECTION_MONTHS = COLLECTION_SHEETS.flatMap((s) => s.months).filter((m) => m <= LAST_COLLECTION_MONTH);

// A member owes every collection month since joining that has no verified payment.
export function memberDues(members, payments) {
    return members.map((member) => {
        const start = member.joinDate?.slice(0, 7);
        const expected = COLLECTION_MONTHS.filter((m) => !start || m >= start);
        const verified = payments.filter((p) => p.member === member.name && p.status === "verified");
        const paidMonths = new Set(verified.map((p) => p.month));
        const dueMonths = expected.filter((m) => !paidMonths.has(m));
        return {
            member,
            expectedCount: expected.length,
            paidCount: expected.length - dueMonths.length,
            dueMonths,
            paidAmount: verified.reduce((a, p) => a + p.amount, 0),
            dueAmount: dueMonths.length * member.monthly,
        };
    });
}

// ["2026-09", "2026-10", "2026-11"] -> "Sep 26 – Nov 26"
export function formatMonths(months) {
    const ranges = [];
    for (const m of months) {
        const last = ranges.at(-1);
        if (last && COLLECTION_MONTHS.indexOf(m) === COLLECTION_MONTHS.indexOf(last.to) + 1)
            last.to = m;
        else
            ranges.push({ from: m, to: m });
    }
    return ranges.map(({ from, to }) => (from === to ? monthYearShort(to) : `${monthYearShort(from)} – ${monthYearShort(to)}`)).join(", ");
}
