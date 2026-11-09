"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Stat } from "@/components/ui";
import { COLLECTION_SHEETS } from "@/data/collection";
import { downloadCsv } from "@/lib/csv";
import { COLLECTION_MONTHS, formatMonths, memberDues } from "@/lib/dues";
import { monthLong, monthShort, num, taka } from "@/lib/format";

const FILTERS = [{ key: "all", label: "All members" }, { key: "due", label: "With dues" }, { key: "clear", label: "No dues" }];
const CELL = "whitespace-nowrap px-3 py-2.5";
// Share of the table for each Dues by Member column. These are minimums the content can still push past, so nothing clips.
const COLUMN_WIDTHS = ["5%", "25%", "13%", "11%", "9%", "15%", "11%", "11%"];

// The day a payment was made, as written in the sheet. Empty when the sheet has no date.
const paidDay = (paidDate) => (/^\d{4}-\d{2}-\d{2}$/.test(paidDate ?? "") ? String(Number(paidDate.slice(8))) : paidDate ?? "");

export default function Page() {
    const { data } = useStore();
    const [filter, setFilter] = useState("all");
    const [year, setYear] = useState(COLLECTION_SHEETS.at(-1).year);
    const dues = memberDues(data.members, data.payments);
    const rows = dues.filter((d) => filter === "all" || (filter === "due") === d.dueMonths.length > 0);
    const totalPaid = dues.reduce((a, d) => a + d.paidAmount, 0);
    const totalDue = dues.reduce((a, d) => a + d.dueAmount, 0);
    const sheet = COLLECTION_SHEETS.find((s) => s.year === year);

    const exportCsv = () => downloadCsv("dues.csv", ["Sl", "Full Name", "Mobile Number", "Collection Months", "Paid Months", "Remaining Months", "Due Month", "Due (Tk)", "Paid (Tk)"], dues.map((d) => [d.member.sl ?? "", d.member.name, d.member.phone ?? "", d.expectedCount, d.paidCount, d.dueMonths.length, formatMonths(d.dueMonths), d.dueAmount, d.paidAmount]));

    return (<div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Dues</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{COLLECTION_MONTHS.length} collection months, {formatMonths(COLLECTION_MONTHS)}</p>
        </div>
        <button className="btn-ghost" onClick={exportCsv}>CSV</button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Expected Collection" value={taka(totalPaid + totalDue)}/>
        <Stat label="Collected" value={taka(totalPaid)}/>
        <Stat label="Total Due" value={taka(totalDue)}/>
        <Stat label="Members with Dues" value={num(dues.filter((d) => d.dueMonths.length > 0).length)} hint={`of ${num(dues.length)} members`}/>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Dues by Member</h2>
          <div className="flex gap-1" role="group" aria-label="Filter members">
            {FILTERS.map((f) => <button key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} className={`rounded-lg px-3 py-1.5 text-sm ${filter === f.key ? "bg-brand text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}>{f.label}</button>)}
          </div>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-left text-sm">
            <colgroup>{COLUMN_WIDTHS.map((width, i) => <col key={i} style={{ width }}/>)}</colgroup>
            <thead className="tbl-head">
              <tr>
                <th className={CELL}>Sl</th><th className={CELL}>Full Name</th><th className={CELL}>Mobile</th>
                <th className={`${CELL} text-center`}>Paid Months</th><th className={`${CELL} text-center`}>Remaining</th>
                <th className={CELL}>Due Month</th><th className={`${CELL} text-right`}>Due</th><th className={`${CELL} text-right`}>Paid</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-500">No members found.</td></tr>}
              {rows.map((d) => (<tr key={d.member.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className={CELL}>{d.member.sl ?? "-"}</td>
                  <td className={`${CELL} font-medium`}>{d.member.name}</td>
                  <td className={CELL}>{d.member.phone || "-"}</td>
                  <td className={`${CELL} text-center`}>{d.paidCount} / {d.expectedCount}</td>
                  <td className={`${CELL} text-center`}>{d.dueMonths.length}</td>
                  <td className={CELL}>{d.dueMonths.length > 0
                ? <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">{formatMonths(d.dueMonths)}</span>
                : <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">✓ No dues</span>}</td>
                  <td className={`${CELL} text-right font-semibold`}>{d.dueAmount > 0 ? taka(d.dueAmount) : "-"}</td>
                  <td className={`${CELL} text-right`}>{taka(d.paidAmount)}</td>
                </tr>))}
            </tbody>
            <tfoot className="tabular-nums">
              <tr className="border-t-2 border-slate-300 font-semibold dark:border-slate-700">
                <td className={CELL} colSpan={5}>Total, all members</td>
                <td className={CELL}/>
                <td className={`${CELL} text-right`}>{taka(totalDue)}</td>
                <td className={`${CELL} text-right`}>{taka(totalPaid)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Monthly Record</h2>
          <div className="flex gap-1" role="group" aria-label="Choose year">
            {COLLECTION_SHEETS.map((s) => <button key={s.year} aria-pressed={year === s.year} onClick={() => setYear(s.year)} className={`rounded-lg px-3 py-1.5 text-sm ${year === s.year ? "bg-brand text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}>{s.year}</button>)}
          </div>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-center text-sm">
            <thead className="tbl-head">
              <tr>
                <th className="sticky left-0 z-10 whitespace-nowrap bg-brand-dark px-3 py-2.5 text-left">Full Name</th>
                {sheet.months.map((m) => <th key={m} className="px-2 py-2.5" title={monthLong(m)}>{monthShort(m)}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.members.map((member) => (<tr key={member.id} className="border-t border-slate-200 dark:border-slate-800">
                  <th scope="row" className="sticky left-0 whitespace-nowrap bg-white px-3 py-2 text-left font-medium dark:bg-slate-900">{member.name}</th>
                  {sheet.months.map((m) => <MonthCell key={m} month={m} member={member} payments={data.payments} entry={dues.find((d) => d.member.id === member.id)}/>)}
                </tr>))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">✓ paid, with no date in the sheet · a number is the paid date · Due means not paid · a dash means not expected</p>
      </section>
    </div>);
}

function MonthCell({ month, member, payments, entry }) {
    const payment = payments.find((p) => p.member === member.name && p.month === month && p.status === "verified");
    if (payment)
        return <td className="whitespace-nowrap bg-emerald-50 px-2 py-2 tabular-nums text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" title={`${monthLong(month)}: paid ${taka(payment.amount)}`}>{paidDay(payment.paidDate) || "✓"}</td>;
    if (entry.dueMonths.includes(month))
        return <td className="bg-amber-100 px-2 py-2 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" title={`${monthLong(month)}: ${taka(member.monthly)} due`}>Due</td>;
    return <td className="px-2 py-2 text-slate-400 dark:text-slate-600">–</td>;
}
