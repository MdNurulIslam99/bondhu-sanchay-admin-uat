"use client";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatDate, taka } from "@/lib/format";
const ST = [{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "paid", label: "Paid" }, { value: "rejected", label: "Rejected" }];
export default function Page() {
    const { update, data } = useStore();
    const members = data.members.map((m) => ({ value: m.name, label: m.name }));
    return (<Resource collection="withdrawals" title="Withdrawal Requests" singular="Request" defaults={{ status: "pending", date: new Date().toISOString().slice(0, 10) }} filter={{ key: "status", label: "Status", all: "All statuses", options: ST }} columns={[
            { key: "member", label: "Member" },
            { key: "amount", label: "Amount", render: (r) => taka(r.amount), csv: (r) => String(r.amount) },
            { key: "reason", label: "Reason" }, { key: "date", label: "Date", render: (r) => formatDate(r.date) },
            { key: "status", label: "Status", render: (r) => <Badge value={r.status}/> },
        ]} fields={[
            { name: "member", label: "Member", type: "select", options: members, required: true },
            { name: "amount", label: "Amount (৳)", type: "number", min: 1, required: true },
            { name: "reason", label: "Reason", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "status", label: "Status", type: "select", options: ST },
        ]}
    // Approval flow: pending -> approved -> paid (or rejected)
    rowActions={(r) => r.status === "pending"
            ? [{ label: "Approve", onClick: () => update("withdrawals", r.id, { status: "approved" }) }, { label: "Reject", danger: true, onClick: () => update("withdrawals", r.id, { status: "rejected" }) }]
            : r.status === "approved" ? [{ label: "Mark paid", onClick: () => update("withdrawals", r.id, { status: "paid" }) }] : []}/>);
}
