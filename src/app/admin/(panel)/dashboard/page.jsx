"use client";
import Link from "next/link";
import { AlertCircle, Landmark, PiggyBank, TrendingUp, Users, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { Stat } from "@/components/ui";
import { ChartCard, ColumnChart, GrowthChart, HorizontalBars, SegmentedBar } from "@/components/charts";
import { COLLECTION_MONTHS, memberDues } from "@/lib/dues";
import { investmentAccounts, investmentTotals } from "@/lib/investments";
import { monthLong, monthYearShort, num, taka } from "@/lib/format";

const sum = (rows) => rows.reduce((a, r) => a + r.amount, 0);

export default function Page() {
    const { data, can } = useStore();
    const ok =data.payments.filter((p) => p.status === "verified");
    const collected = sum(ok);
    const investing = investmentTotals(investmentAccounts(data.investments, data.profits));
    const invested = investing.invested;
    const profit = investing.collected;
    const paidOut = sum(data.withdrawals.filter((w) => w.status === "paid"));
    const allTotal = collected + profit - paidOut;
    const active = data.members.filter((m) => m.status === "active");
    const dues = memberDues(data.members, data.payments);
    const owing = dues.filter((d) => d.dueAmount > 0);
    const totalDue = owing.reduce((a, d) => a + d.dueAmount, 0);

    const monthly = COLLECTION_MONTHS.map((m) => ({ label: monthYearShort(m), title: monthLong(m), value: sum(ok.filter((p) => p.month === m)) }));
    let running = 0;
    const growth = monthly.map((m) => ({ ...m, value: (running += m.value) }));
    const dueBars = owing.map((d) => ({ label: d.member.name, title: d.member.name, value: d.dueAmount })).sort((a, b) => b.value - a.value);
    const tableRows = (rows) => rows.map((r) => [r.title, taka(r.value)]);

    return (<div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        <Stat icon={Users} label="Total Members" value={num(data.members.length)} hint={`${num(active.length)} active`}/>
        <Stat icon={Wallet} label="Total Collection" value={taka(collected)}/>
        <Stat icon={AlertCircle} label="Total Due" value={taka(totalDue)} hint={`${num(owing.length)} members`}/>
        <Stat icon={Landmark} label="Invested" value={taka(invested)}/>
        <Stat icon={TrendingUp} label="Profit" value={taka(profit)} hint={investing.pending > 0 ? `${taka(investing.pending)} pending` : undefined}/>
        <Stat icon={PiggyBank} label="All Total" value={taka(allTotal)} hint={paidOut > 0 ? "Collection + profit − paid withdrawals" : "Collection + profit"}/>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Monthly Collection" subtitle="Verified deposits per month" table={{ head: ["Month", "Collection"], rows: tableRows(monthly) }}>
          <ColumnChart data={monthly} label="Column chart of verified deposits per month"/>
        </ChartCard>
        <ChartCard title="Collection Growth" subtitle="Cumulative verified deposits" table={{ head: ["Month", "Total"], rows: tableRows(growth) }}>
          <GrowthChart data={growth} label="Area chart of cumulative verified deposits"/>
        </ChartCard>
        <ChartCard title="Dues by Member" subtitle="Unpaid amount, highest first" table={{ head: ["Member", "Due"], rows: tableRows(dueBars) }}>
          {dueBars.length > 0 ? <HorizontalBars data={dueBars} label="Bar chart of the amount due from each member"/> : <p className="py-10 text-center text-sm text-slate-500">Everyone has paid 🎉</p>}
        </ChartCard>
        <section className="card space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold">Collection Status</h2>
            {can("dues") && <Link href="/admin/dues" className="shrink-0 text-sm font-medium text-brand hover:underline dark:text-gold">View all dues →</Link>}
          </div>
          <SegmentedBar title="Expected collection" format={taka} parts={[
            { key: "green", label: "Collected", value: collected },
            { key: "amber", label: "Due", value: totalDue },
        ]}/>
          <SegmentedBar title="Members" parts={[
            { key: "green", label: "No dues", value: dues.length - owing.length },
            { key: "amber", label: "With dues", value: owing.length },
        ]}/>
          <div>
            <div className="mb-2 text-sm font-medium">Members with dues ({num(owing.length)})</div>
            <div className="flex flex-wrap gap-1.5">
              {owing.length === 0 ? <span className="text-sm text-slate-500">Everyone has paid 🎉</span>
            : owing.map((d) => <span key={d.member.id} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">{d.member.name} · {d.dueMonths.length} mo</span>)}
            </div>
          </div>
        </section>
      </div>

      <section className="card">
        <h2 className="mb-2 font-semibold">Recent Activity</h2>
        {data.audit.length === 0 ? <p className="text-sm text-slate-500">No activity yet.</p> : (<ul className="space-y-1.5 text-sm">
            {data.audit.slice(0, 6).map((a) => <li key={a.id}><b>{a.user}</b> — {a.action} <span className="text-slate-500">({a.target})</span></li>)}
          </ul>)}
      </section>
    </div>);
}
