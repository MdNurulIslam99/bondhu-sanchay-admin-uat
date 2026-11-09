"use client";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatMonths, memberDues } from "@/lib/dues";
import { taka } from "@/lib/format";
const ST = [{ value: "active", label: "Active" }, { value: "pending", label: "Pending" }, { value: "inactive", label: "Inactive" }];
export default function Page() {
    const { update, data } = useStore();
    const dues = Object.fromEntries(memberDues(data.members, data.payments).map((d) => [d.member.id, d]));
    return (<Resource collection="members" title="Members" singular="Member" compactActions defaults={{ status: "pending", monthly: data.settings.monthlyAmount, joinDate: new Date().toISOString().slice(0, 10) }} filter={{ key: "status", label: "Status", all: "All statuses", options: ST }} columns={[
            { key: "name", label: "Name" },
            { key: "phone", label: "Mobile", render: (r) => r.phone || "-" },
            { key: "paidCount", label: "Paid Months", render: (r) => `${dues[r.id].paidCount} / ${dues[r.id].expectedCount}`, csv: (r) => String(dues[r.id].paidCount) },
            { key: "dueMonths", label: "Due Month", noSort: true, render: (r) => dues[r.id].dueMonths.length > 0
                    ? <span className="whitespace-nowrap">{formatMonths(dues[r.id].dueMonths)}</span>
                    : "-", csv: (r) => formatMonths(dues[r.id].dueMonths) },
            { key: "dueAmount", label: "Due", render: (r) => dues[r.id].dueAmount > 0
                    ? <span className="whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">{taka(dues[r.id].dueAmount)}</span>
                    : "-", csv: (r) => String(dues[r.id].dueAmount) },
            { key: "paidAmount", label: "Paid", render: (r) => taka(dues[r.id].paidAmount), csv: (r) => String(dues[r.id].paidAmount) },
            { key: "status", label: "Status", render: (r) => <Badge value={r.status}/> },
        ]} fields={[
            { name: "name", label: "Name", required: true },
            { name: "phone", label: "Mobile", type: "tel" },
            { name: "nid", label: "NID", pattern: /^\d{10,17}$/, patternMsg: "NID must be 10–17 digits" },
            { name: "address", label: "Address" },
            { name: "nominee", label: "Nominee" },
            { name: "joinDate", label: "Join Date", type: "date" },
            { name: "monthly", label: "Monthly Deposit (৳)", type: "number", min: 1, required: true },
            { name: "status", label: "Status", type: "select", options: ST },
        ]} rowActions={(r) => r.status === "pending" ? [{ label: "Approve", onClick: () => update("members", r.id, { status: "active" }) }]
            : r.status === "active" ? [{ label: "Deactivate", danger: true, onClick: () => update("members", r.id, { status: "inactive" }) }] : []}/>);
}
