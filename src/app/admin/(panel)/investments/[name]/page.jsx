"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CircleDollarSign, Clock, Landmark, Receipt } from "lucide-react";
import { FormModal } from "@/components/Resource";
import { Badge, Stat } from "@/components/ui";
import { useStore } from "@/lib/store";
import { investmentAccounts, profitRate } from "@/lib/investments";
import { formatDate, monthLong, taka } from "@/lib/format";

const TH = "whitespace-nowrap px-3 py-3 font-semibold";
const TD = "whitespace-nowrap px-3 py-2.5";
const FIELDS = [
    { name: "collected", label: "Profit Collected (৳)", type: "number", min: 0, required: true },
    { name: "cost", label: "Cost (৳)", type: "number", min: 0, required: true },
    { name: "note", label: "Note", full: true },
];
const money = (v) => (v > 0 ? taka(v) : "-");

export default function Page() {
    const params = useParams();
    const name = decodeURIComponent(params.name);
    const { data, can, create, update } = useStore();
    const [editing, setEditing] = useState(null);
    const account = investmentAccounts(data.investments, data.profits).find((a) => a.name === name);
    if (!account)
        return (<div className="card mx-auto mt-10 max-w-md text-center">
        <h1 className="text-lg font-semibold">Investment account not found</h1>
        <Link href="/admin/investments" className="btn-primary mt-4">Back to Investments</Link>
      </div>);

    const projects = data.projects.filter((p) => p.account === name);
    const canRecord = (row) => can("profits", row.record ? "update" : "create");
    const save = (values) => {
        if (editing.record)
            update("profits", editing.record.id, values);
        else
            create("profits", { account: name, month: editing.month, ...values });
        setEditing(null);
    };

    return (<div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/investments" aria-label="Back to Investments" className="grid size-9 place-items-center rounded-full bg-brand text-white hover:bg-brand-dark"><ArrowLeft size={18}/></Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{account.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{account.monthsCollected} of {account.monthsPassed} profit months collected · {taka(account.monthlyProfit)} a month</p>
        </div>
      </div>

      {projects.map((p) => (<section key={p.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
          {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-32 w-full rounded-lg object-cover sm:w-52"/>}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{p.name}</h2><Badge value={p.status}/></div>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{[p.businessType, p.location].filter(Boolean).join(" · ")}</p>
            {p.summary && <p className="mt-2 text-sm">{p.summary}</p>}
          </div>
          {can("projects", "update") && <Link href={`/admin/projects/${p.id}`} className="btn-ghost shrink-0">Edit Project</Link>}
        </section>))}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Landmark} label="Invested" value={taka(account.invested)} hint={`${account.entries.length} ${account.entries.length === 1 ? "entry" : "entries"}`}/>
        <Stat icon={CircleDollarSign} label="Profit Collected" value={taka(account.collected)}/>
        <Stat icon={Clock} label="Profit Pending" value={taka(account.pending)}/>
        <Stat icon={Receipt} label="Costs" value={taka(account.cost)}/>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Monthly Profit</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="tbl-head">
              <tr>
                <th className={TH}>Month</th><th className={`${TH} text-right`}>Expected</th><th className={`${TH} text-right`}>Collected</th>
                <th className={`${TH} text-right`}>Cost</th><th className={`${TH} text-right`}>Pending</th><th className={TH}>Status</th><th className={TH}>Note</th><th className={`${TH} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {account.months.map((m) => (<tr key={m.month} className="border-t border-slate-200 dark:border-slate-800">
                  <td className={`${TD} font-medium`}>{monthLong(m.month)}</td>
                  <td className={`${TD} text-right`}>{money(m.expected)}</td>
                  <td className={`${TD} text-right`}>{money(m.collected)}</td>
                  <td className={`${TD} text-right`}>{money(m.cost)}</td>
                  <td className={`${TD} text-right font-semibold`}>{money(m.pending)}</td>
                  <td className={TD}>{m.status === "none" ? "-" : <Badge value={m.status}/>}</td>
                  <td className={`${TD} text-slate-500 dark:text-slate-400`}>{m.note || "-"}</td>
                  <td className={`${TD} text-right`}>{canRecord(m) && <button className={`act ${m.record ? "act-edit" : "act-extra"}`} onClick={() => setEditing(m)}>{m.record ? "Edit" : "Record"}</button>}</td>
                </tr>))}
            </tbody>
            <tfoot className="tabular-nums">
              <tr className="border-t-2 border-slate-300 font-semibold dark:border-slate-700">
                <td className={TD} colSpan={2}>Total</td>
                <td className={`${TD} text-right`}>{taka(account.collected)}</td>
                <td className={`${TD} text-right`}>{taka(account.cost)}</td>
                <td className={`${TD} text-right`}>{taka(account.pending)}</td>
                <td className={TD} colSpan={3}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Investment Entries</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="tbl-head">
              <tr><th className={TH}>SL</th><th className={TH}>Invest Date</th><th className={`${TH} text-right`}>Invest Amount</th><th className={`${TH} text-right`}>Profit Rate</th><th className={`${TH} text-right`}>Rate %</th><th className={TH}>First Profit Month</th><th className={TH}>Status</th></tr>
            </thead>
            <tbody className="tabular-nums">
              {account.entries.map((e, i) => (<tr key={e.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className={`${TD} text-slate-500`}>{i + 1}</td>
                  <td className={TD}>{formatDate(e.investDate)}</td>
                  <td className={`${TD} text-right`}>{taka(e.amount)}</td>
                  <td className={`${TD} text-right`}>{taka(e.monthlyProfit)}</td>
                  <td className={`${TD} text-right`}>{profitRate(e).toFixed(1)}%</td>
                  <td className={TD}>{monthLong(e.firstProfitMonth)}</td>
                  <td className={TD}><Badge value={e.status}/></td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && <FormModal title={`Profit for ${monthLong(editing.month)}`} fields={FIELDS} initial={editing.record ?? { collected: editing.expected, cost: 0 }} onClose={() => setEditing(null)} onSave={save}/>}
    </div>);
}
