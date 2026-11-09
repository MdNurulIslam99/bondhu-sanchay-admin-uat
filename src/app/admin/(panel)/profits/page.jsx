"use client";
import { useMemo } from "react";
import { CircleDollarSign, Coins, Receipt } from "lucide-react";
import Resource from "@/components/Resource";
import { Stat } from "@/components/ui";
import { useStore } from "@/lib/store";
import { monthLong, taka } from "@/lib/format";

const byMonthNewestFirst = (a, b) => b.month.localeCompare(a.month) || a.account.localeCompare(b.account);

export default function Page() {
    const { data } = useStore();
    const names = useMemo(() => [...new Set(data.investments.map((i) => i.name))].map((n) => ({ value: n, label: n })), [data.investments]);
    const filter = useMemo(() => ({ key: "account", label: "Account", all: "All accounts", options: names }), [names]);
    const collected = data.profits.reduce((a, p) => a + (Number(p.collected) || 0), 0);
    const cost = data.profits.reduce((a, p) => a + (Number(p.cost) || 0), 0);
    const isDuplicate = (v, row) => data.profits.some((p) => p.id !== row?.id && p.account === v.account && p.month === v.month);
    return (<Resource collection="profits" title="Profit & Costs" singular="Record" defaults={{ collected: 0, cost: 0 }} order={byMonthNewestFirst} filter={filter} validate={(v, row) => (isDuplicate(v, row) ? { month: "This account already has a record for this month" } : null)} top={<div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Stat icon={Coins} label="Earned Before Costs" value={taka(collected + cost)}/>
          <Stat icon={Receipt} label="Costs" value={taka(cost)}/>
          <Stat icon={CircleDollarSign} label="Profit Collected" value={taka(collected)} hint="After costs"/>
        </div>} columns={[
            { key: "account", label: "Account" },
            { key: "month", label: "Month", render: (r) => monthLong(r.month) },
            { key: "collected", label: "Profit Collected", render: (r) => taka(r.collected) },
            { key: "cost", label: "Cost", render: (r) => (Number(r.cost) > 0 ? taka(r.cost) : "-") },
            { key: "note", label: "Note", render: (r) => r.note || "-" },
        ]} fields={[
            { name: "account", label: "Account", type: "select", options: names, required: true },
            { name: "month", label: "Month (YYYY-MM)", required: true, pattern: /^\d{4}-(0[1-9]|1[0-2])$/, patternMsg: "For example, 2026-11" },
            { name: "collected", label: "Profit Collected (৳)", type: "number", min: 0, required: true },
            { name: "cost", label: "Cost (৳)", type: "number", min: 0, required: true },
            { name: "note", label: "Note", full: true },
        ]}/>);
}
