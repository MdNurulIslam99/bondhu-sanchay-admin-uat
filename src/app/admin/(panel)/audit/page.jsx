"use client";
import { useStore } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
export default function Page() {
    const { data } = useStore();
    return (<div>
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Audit Log</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="tbl-head"><tr>
            <th className="px-3 py-2.5">Time</th><th className="px-3 py-2.5">User</th><th className="px-3 py-2.5">Action</th><th className="px-3 py-2.5">Target</th></tr></thead>
          <tbody>
            {data.audit.length === 0 && <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-500">No changes yet. Changes to data will appear here.</td></tr>}
            {data.audit.map((a) => (<tr key={a.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="whitespace-nowrap px-3 py-2">{formatDateTime(a.at)}</td>
                <td className="px-3 py-2">{a.user}</td><td className="px-3 py-2">{a.action}</td><td className="px-3 py-2 text-slate-500">{a.target}</td>
              </tr>))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">The audit log is read-only and cannot be deleted.</p>
    </div>);
}
