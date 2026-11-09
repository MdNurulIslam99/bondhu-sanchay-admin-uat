"use client";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACTION_LABEL, DEFAULT_PERMISSIONS, EDITABLE_ROLES, MODULES, ROLES } from "@/lib/permissions";

const clone = (o) => JSON.parse(JSON.stringify(o));
const ACTIONS = ["create", "update", "delete"];
const EDITABLE_MODULES = MODULES.filter((m) => !m.superOnly && m.actions.some((a) => a !== "view"));
const editable = (mod) => mod.actions.filter((a) => a !== "view");

// What each role can do on the pages its users are given. Which pages they see is set on User Permissions.
export default function Page() {
    const { data, savePermissions } = useStore();
    const [draft, setDraft] = useState(() => clone(data.permissions));
    const [role, setRole] = useState(EDITABLE_ROLES[0].key);
    const [saved, setSaved] = useState(false);
    const dirty = JSON.stringify(draft) !== JSON.stringify(data.permissions);
    const userCount = (key) => data.users.filter((u) => u.role === key).length;
    const allowed = (mod) => draft[role]?.[mod.key] ?? [];
    const setActions = (mod, actions) => {
        setSaved(false);
        setDraft((cur) => ({ ...cur, [role]: { ...cur[role], [mod.key]: mod.actions.filter((a) => actions.includes(a)) } }));
    };
    const toggle = (mod, action) => setActions(mod, allowed(mod).includes(action) ? allowed(mod).filter((a) => a !== action) : [...allowed(mod), action]);
    const allOn = (mod) => editable(mod).every((a) => allowed(mod).includes(a));
    const toggleAll = (mod) => setActions(mod, allOn(mod) ? allowed(mod).filter((a) => a === "view") : mod.actions);
    const groups = [...new Set(EDITABLE_MODULES.map((m) => m.group))];

    return (<div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Role Actions</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose what each role can do on the pages its users can see. Which pages a user sees is set on <Link href="/admin/user-permissions" className="font-medium text-brand underline dark:text-gold">User Permissions</Link>.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && !dirty && <span role="status" className="text-sm text-emerald-700 dark:text-emerald-400">Saved ✓</span>}
          <button className="btn-ghost" onClick={() => { setSaved(false); setDraft(clone(DEFAULT_PERMISSIONS)); }}>Reset to Default</button>
          <button className="btn-primary" disabled={!dirty} onClick={() => { savePermissions(draft); setSaved(true); }}>Save Changes</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLES.map((r) => {
            const locked = r.key === "super_admin";
            const active = role === r.key;
            const body = (<>
              <span className="flex items-center justify-between gap-2 font-semibold">{r.label}{locked && <ShieldCheck size={17} className="text-brand dark:text-gold"/>}</span>
              <span className="mt-1 block text-sm font-normal text-slate-500 dark:text-slate-400">{r.description}</span>
              <span className="mt-2 block text-xs font-normal text-slate-500">{userCount(r.key)} {userCount(r.key) === 1 ? "user" : "users"}{locked ? " · always full access" : ""}</span>
            </>);
            return locked ? <div key={r.key} className="card">{body}</div> : (<button key={r.key} type="button" aria-pressed={active} onClick={() => setRole(r.key)} className={`card text-left transition hover:border-brand ${active ? "border-brand ring-2 ring-brand/30" : ""}`}>{body}</button>);
        })}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="tbl-head">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Page</th>
              {ACTIONS.map((a) => <th key={a} className="px-3 py-3 text-center font-semibold">{ACTION_LABEL[a]}</th>)}
              <th className="px-3 py-3 text-center font-semibold">All</th>
            </tr>
          </thead>
          {groups.map((group) => (<tbody key={group}>
              <tr><th colSpan={5} scope="colgroup" className="bg-slate-100 px-4 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">{group}</th></tr>
              {EDITABLE_MODULES.filter((m) => m.group === group).map((mod) => (<tr key={mod.key} className="border-t border-slate-200 dark:border-slate-800">
                  <th scope="row" className="whitespace-nowrap px-4 py-2.5 text-left font-medium">{mod.label}</th>
                  {ACTIONS.map((a) => (<td key={a} className="px-3 py-2.5 text-center">
                      {mod.actions.includes(a)
                    ? <input type="checkbox" className="size-4 accent-brand" aria-label={`${ACTION_LABEL[a]} ${mod.label}`} checked={allowed(mod).includes(a)} onChange={() => toggle(mod, a)}/>
                    : <span className="text-slate-300 dark:text-slate-600" title="Not available on this page">–</span>}
                    </td>))}
                  <td className="px-3 py-2.5 text-center"><input type="checkbox" className="size-4 accent-brand" aria-label={`All actions for ${mod.label}`} checked={allOn(mod)} onChange={() => toggleAll(mod)}/></td>
                </tr>))}
            </tbody>))}
        </table>
      </div>
    </div>);
}
