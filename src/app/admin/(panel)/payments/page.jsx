"use client";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatDate, monthLong, monthYearShort, taka } from "@/lib/format";
// The sheet records dates as written, so some are not full dates (for example "10/25").
const showDate = (d) => (!d ? "-" : /^\d{4}-\d{2}-\d{2}$/.test(d) ? formatDate(d) : d);
// Months are stored as YYYY-MM, so search also has to match the names shown on screen.
const search = (r) => [r.member, r.month, monthYearShort(r.month), monthLong(r.month), r.amount, r.paidDate, r.method, r.trxId, r.status].join(" ");
export default function Page() {
    const { update, data } = useStore();
    const members = data.members.filter((m) => m.status === "active").map((m) => ({ value: m.name, label: m.name }));
    const methods = [{ value: "", label: "Not recorded" }, ...["bKash", "Nagad", "Bank", "Cash"].map((m) => ({ value: m, label: m }))];
    return (<Resource collection="payments" title="Monthly Deposits" singular="Deposit" search={search} defaults={{ amount: data.settings.monthlyAmount, status: "pending", month: new Date().toISOString().slice(0, 7) }} filter={{ key: "status", label: "Status", all: "All statuses", options: [{ value: "verified", label: "Verified" }, { value: "pending", label: "Pending" }, { value: "reversed", label: "Reversed" }] }} columns={[
            { key: "member", label: "Member" }, { key: "month", label: "Month", render: (r) => <span className="whitespace-nowrap">{monthYearShort(r.month)}</span> },
            { key: "amount", label: "Amount", render: (r) => taka(r.amount), csv: (r) => String(r.amount) },
            { key: "paidDate", label: "Paid Date", render: (r) => showDate(r.paidDate) },
            { key: "method", label: "Method", render: (r) => r.method || "-" }, { key: "trxId", label: "Transaction ID", render: (r) => r.trxId || "-" },
            { key: "status", label: "Status", render: (r) => <Badge value={r.status}/> },
        ]} fields={[
            { name: "member", label: "Member", type: "select", options: members, required: true },
            { name: "month", label: "Month (YYYY-MM)", required: true, pattern: /^\d{4}-(0[1-9]|1[0-2])$/, patternMsg: "For example, 2026-11", view: (r) => monthYearShort(r.month) },
            { name: "amount", label: "Amount (৳)", type: "number", min: 1, required: true },
            { name: "paidDate", label: "Paid Date (YYYY-MM-DD)" },
            { name: "method", label: "Payment Method", type: "select", options: methods },
            { name: "trxId", label: "Transaction ID" },
            { name: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Pending" }, { value: "verified", label: "Verified" }] },
        ]}
    // Financial entries cannot be deleted, only verified or reversed
    rowActions={(r) => r.status === "pending" ? [{ label: "Verify", onClick: () => update("payments", r.id, { status: "verified" }) }]
            : r.status === "verified" ? [{ label: "Reverse", danger: true, onClick: () => update("payments", r.id, { status: "reversed" }) }] : []}/>);
}
