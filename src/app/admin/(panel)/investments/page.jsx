"use client";
import Link from "next/link";
import { CircleDollarSign, Clock, Landmark, Receipt, Wallet } from "lucide-react";
import Resource from "@/components/Resource";
import { Badge, Stat } from "@/components/ui";
import { ChartCard, ColumnChart, HorizontalBars } from "@/components/charts";
import { useStore } from "@/lib/store";
import { investmentAccounts, investmentTotals, monthlyProfit, profitRate } from "@/lib/investments";
import { formatDate, monthLong, monthYearShort, taka } from "@/lib/format";

const STATUS =[{ value: "running", label: "Running" }, { value: "completed", label: "Completed" }, { value: "planned", label: "Planned" }];
const accountHref = (name) => `/admin/investments/${encodeURIComponent(name)}`;
const TH = "whitespace-nowrap px-3 py-3 font-semibold";
const TD = "whitespace-nowrap px-3 py-2.5";

export default function Page() {
    const { data } = useStore();
    const accounts = investmentAccounts(data.investments, data.profits);
    const totals = investmentTotals(accounts);
    const deposits = data.payments.filter((p) => p.status === "verified").reduce((a, p) => a + p.amount, 0);
    const paidOut = data.withdrawals.filter((w) => w.status === "paid").reduce((a, w) => a + w.amount, 0);
    const balance = deposits + totals.collected - totals.invested - paidOut;
    const monthly = monthlyProfit(accounts).map((m) => ({ label: monthYearShort(m.month), title: monthLong(m.month), value: m.value }));
    const invested = accounts.map((a) => ({ label: a.name, title: a.name, value: a.invested })).sort((a, b) => b.value - a.value);
    const rows = (list) => list.map((r) => [r.title, taka(r.value)]);

    return (<div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Investments</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Money invested, the monthly profit expected from it, and what has been collected.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
        <Stat icon={Landmark} label="Total Invested" value={taka(totals.invested)} hint={`${accounts.length} accounts`}/>
        <Stat icon={CircleDollarSign} label="Profit Collected" value={taka(totals.collected)} hint="After costs"/>
        <Stat icon={Clock} label="Profit Pending" value={taka(totals.pending)} hint="Expected but not collected"/>
        <Stat icon={Receipt} label="Costs" value={taka(totals.cost)} hint="Taken from profit"/>
        <Stat icon={Wallet} label="Cash Balance" value={taka(balance)} hint="Collection + profit − invested"/>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Monthly Profit Collected" subtitle="After costs" table={{ head: ["Month", "Collected"], rows: rows(monthly) }}>
          <ColumnChart data={monthly} label="Column chart of profit collected each month"/>
        </ChartCard>
        <ChartCard title="Invested by Account" subtitle="Highest first" table={{ head: ["Account", "Invested"], rows: rows(invested) }}>
          <HorizontalBars data={invested} label="Bar chart of the amount invested in each account"/>
        </ChartCard>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Investment Accounts</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="tbl-head">
              <tr>
                <th className={TH}>SL</th><th className={TH}>Name</th><th className={TH}>Project</th>
                <th className={`${TH} text-right`}>Invested</th><th className={`${TH} text-right`}>Monthly Profit</th>
                <th className={`${TH} text-right`}>Months Collected</th><th className={`${TH} text-right`}>Collected</th>
                <th className={`${TH} text-right`}>Cost</th><th className={`${TH} text-right`}>Pending</th><th className={`${TH} text-right`}>Details</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {accounts.length === 0 && <tr><td colSpan={10} className="px-3 py-12 text-center text-slate-500">No investments yet.</td></tr>}
              {accounts.map((a, i) => (<tr key={a.name} className="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <td className={`${TD} text-slate-500`}>{i + 1}</td>
                  <td className={`${TD} font-medium`}><Link href={accountHref(a.name)} className="text-brand hover:underline dark:text-gold">{a.name}</Link></td>
                  <td className={TD}>{data.projects.filter((p) => p.account === a.name).map((p) => p.name).join(", ") || "-"}</td>
                  <td className={`${TD} text-right`}>{taka(a.invested)}</td>
                  <td className={`${TD} text-right`}>{taka(a.monthlyProfit)}</td>
                  <td className={`${TD} text-right`}>{a.monthsCollected} of {a.monthsPassed}</td>
                  <td className={`${TD} text-right`}>{taka(a.collected)}</td>
                  <td className={`${TD} text-right`}>{a.cost > 0 ? taka(a.cost) : "-"}</td>
                  <td className={`${TD} text-right`}>{a.pending > 0 ? <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">{taka(a.pending)}</span> : "-"}</td>
                  <td className={`${TD} text-right`}><Link href={accountHref(a.name)} className="act act-view">View</Link></td>
                </tr>))}
            </tbody>
            {accounts.length > 0 && (<tfoot className="tabular-nums">
                <tr className="border-t-2 border-slate-300 font-semibold dark:border-slate-700">
                  <td className={TD} colSpan={3}>Total</td>
                  <td className={`${TD} text-right`}>{taka(totals.invested)}</td>
                  <td className={TD} colSpan={2}/>
                  <td className={`${TD} text-right`}>{taka(totals.collected)}</td>
                  <td className={`${TD} text-right`}>{taka(totals.cost)}</td>
                  <td className={`${TD} text-right`}>{taka(totals.pending)}</td>
                  <td className={TD}/>
                </tr>
              </tfoot>)}
          </table>
        </div>
      </section>

      <Resource as="h2" collection="investments" title="Investment Entries" singular="Investment" defaults={{ status: "running" }} filter={{ key: "status", label: "Status", all: "All statuses", options: STATUS }} deleteText={(r) => `The ${taka(r.amount)} entry for ${r.name} will be deleted. Profit records already saved are kept. This cannot be undone.`} columns={[
            { key: "name", label: "Name" },
            { key: "investDate", label: "Invest Date", render: (r) => formatDate(r.investDate) },
            { key: "amount", label: "Invest Amount", render: (r) => taka(r.amount) },
            { key: "monthlyProfit", label: "Profit Rate", render: (r) => `${taka(r.monthlyProfit)} a month`, csv: (r) => String(r.monthlyProfit) },
            { key: "rate", label: "Rate %", noSort: true, render: (r) => `${profitRate(r).toFixed(1)}%`, csv: (r) => profitRate(r).toFixed(1) },
            { key: "firstProfitMonth", label: "First Profit Month", render: (r) => monthLong(r.firstProfitMonth) },
            { key: "status", label: "Status", render: (r) => <Badge value={r.status}/> },
        ]} fields={[
            { name: "name", label: "Name", required: true },
            { name: "investDate", label: "Invest Date", type: "date", required: true },
            { name: "amount", label: "Invest Amount (৳)", type: "number", min: 1, required: true },
            { name: "monthlyProfit", label: "Profit Rate per Month (৳)", type: "number", min: 0, required: true },
            { name: "firstProfitMonth", label: "First Profit Month (YYYY-MM)", required: true, pattern: /^\d{4}-(0[1-9]|1[0-2])$/, patternMsg: "For example, 2026-11" },
            { name: "status", label: "Status", type: "select", options: STATUS },
        ]}/>
    </div>);
}
