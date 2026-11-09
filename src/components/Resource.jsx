"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { downloadCsv } from "@/lib/csv";
import { Badge, Confirm, Modal } from "./ui";
const PAGE = 10;

// 1 2 3 ... 9 style page numbers around the current page.
const pageNumbers = (cur, pages) => {
    const out = [];
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - cur) <= 1)
            out.push(i);
        else if (out.at(-1) !== "…")
            out.push("…");
    }
    return out;
};

// `compact` shows only the icon, for tables with many columns.
function ActionButton({ compact, tone, icon: Icon, label, onClick }) {
    return (<button className={`act ${tone} ${compact ? "size-7 justify-center px-0 py-0" : ""}`} title={label} aria-label={label} onClick={onClick}>
      <Icon size={13}/>{!compact && label}
    </button>);
}

export default function Resource(p) {
    const { data, can, create, update, remove } = useStore();
    const moduleKey = p.module ?? p.collection;
    const rows = data[p.collection];
    const [q, setQ] = useState("");
    const [flt, setFlt] = useState("");
    const [sort, setSort] = useState(null);
    const [page, setPage] = useState(1);
    const [view, setView] = useState(null);
    const [edit, setEdit] = useState(null);
    const [del, setDel] = useState(null);
    const list = useMemo(() => {
        let r = p.order ? [...rows].sort(p.order) : rows;
        if (flt && p.filter)
            r = r.filter((x) => String(x[p.filter.key]) === flt);
        if (q.trim()) {
            const s = q.trim().toLowerCase();
            r = r.filter((x) => (p.search ? [p.search(x)] : Object.values(x).filter((v) => typeof v !== "object")).some((v) => String(v).toLowerCase().includes(s)));
        }
        if (sort)
            r = [...r].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0) * sort.dir);
        return r;
    }, [rows, q, flt, sort, p.filter, p.order, p.search]);
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    const cur = Math.min(page, pages);
    const offset = (cur - 1) * PAGE;
    const slice = list.slice(offset, offset + PAGE);
    const canC = can(moduleKey, "create"), canU = can(moduleKey, "update"), canD = can(moduleKey, "delete");
    const exportCsv = () => downloadCsv(`${moduleKey}.csv`, p.columns.map((c) => c.label), list.map((r) => p.columns.map((c) => (c.csv ? c.csv(r) : r[c.key] ?? ""))));
    const startEdit = (r) => (p.onEdit ? p.onEdit(r) : setEdit(r));
    const Heading = p.as ?? "h1";
    return (<div>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${p.as ? "mb-3" : "mb-4"}`}>
        <Heading className={p.as ? "font-semibold" : "text-xl font-bold sm:text-2xl"}>{p.title} <span className="text-sm font-normal text-slate-500">({list.length})</span></Heading>
        <div className="flex flex-wrap gap-2">
          {p.actions}
          <button className="btn-ghost" onClick={exportCsv}><Download size={15}/>CSV</button>
          {canC && <button className="btn-primary" onClick={() => (p.onCreate ? p.onCreate() : setEdit("new"))}><Plus size={16}/>New {p.singular}</button>}
        </div>
      </div>

      {p.top}

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <label className="relative sm:w-72">
          <Search size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input className="inp pl-9" placeholder={`Search ${p.title}…`} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search"/>
        </label>
        {p.filter && (<select className="inp sm:max-w-[200px]" value={flt} onChange={(e) => { setFlt(e.target.value); setPage(1); }} aria-label={p.filter.label}>
            <option value="">{p.filter.all}</option>
            {p.filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>)}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="tbl-head">
            <tr>
              <th className="px-4 py-3 font-semibold">SL</th>
              {p.columns.map((c) => (<th key={c.key} aria-sort={sort?.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined} className={`select-none whitespace-nowrap px-3 py-3 font-semibold ${c.noSort ? "" : "cursor-pointer"}`} onClick={c.noSort ? undefined : () => setSort((s) => (s?.key === c.key ? { key: c.key, dir: (s.dir * -1) } : { key: c.key, dir: 1 }))}>
                  {c.label}{sort?.key === c.key ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
                </th>))}
              <th className="sticky right-0 bg-brand-dark px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && <tr><td colSpan={p.columns.length + 2} className="px-3 py-12 text-center text-slate-500">No records found.</td></tr>}
            {slice.map((r, i) => (<tr key={r.id} className="group border-t border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <td className="px-4 py-2.5 tabular-nums text-slate-500">{offset + i + 1}</td>
                {p.columns.map((c) => <td key={c.key} className="px-3 py-2.5">{c.render ? c.render(r) : String(r[c.key] ?? "-")}</td>)}
                <td className="sticky right-0 bg-white px-4 py-2.5 group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800">
                  <div className="flex justify-end gap-1.5">
                    <ActionButton compact={p.compactActions} tone="act-view" icon={Eye} label="View" onClick={() => setView(r)}/>
                    {canU && <ActionButton compact={p.compactActions} tone="act-edit" icon={Pencil} label="Edit" onClick={() => startEdit(r)}/>}
                    {canU && p.rowActions?.(r).map((a) => <button key={a.label} className={`act ${a.danger ? "act-danger" : "act-extra"}`} onClick={a.onClick}>{a.label}</button>)}
                    {canD && <ActionButton compact={p.compactActions} tone="act-danger" icon={Trash2} label="Delete" onClick={() => setDel(r)}/>}
                  </div>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>

      <nav aria-label="Pagination" className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-slate-500">Page {cur} of {pages}</span>
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2 py-1.5" aria-label="Previous page" disabled={cur <= 1} onClick={() => setPage(cur - 1)}><ChevronLeft size={16}/></button>
          {pageNumbers(cur, pages).map((n, i) => n === "…" ? <span key={`gap-${i}`} className="px-1 text-slate-400">…</span> : <button key={n} aria-current={n === cur ? "page" : undefined} className={n === cur ? "btn-primary min-w-8 px-2 py-1.5" : "btn-ghost min-w-8 px-2 py-1.5"} onClick={() => setPage(n)}>{n}</button>)}
          <button className="btn-ghost px-2 py-1.5" aria-label="Next page" disabled={cur >= pages} onClick={() => setPage(cur + 1)}><ChevronRight size={16}/></button>
        </div>
      </nav>

      {view && (<Modal title={`${p.singular} Details`} onClose={() => setView(null)}>
          <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
            {p.fields.map((f) => (<div key={f.name} className="contents">
                <dt className="text-slate-500">{f.label}</dt>
                <dd className="col-span-2 break-words">
                  {f.view ? f.view(view) : f.type === "select" ? (f.name === "status" || f.name === "published" ? <Badge value={view[f.name]}/> : f.options?.find((o) => o.value === view[f.name])?.label ?? view[f.name]) : String(view[f.name] ?? "-")}
                </dd>
              </div>))}
          </dl>
        </Modal>)}
      {edit && (<FormModal title={edit === "new" ? `New ${p.singular}` : `Edit ${p.singular}`} fields={p.fields} initial={edit === "new" ? { ...p.defaults } : edit} validate={p.validate ? (v) => p.validate(v, edit === "new" ? null : edit) : undefined} onClose={() => setEdit(null)} onSave={(v) => { edit === "new" ? create(p.collection, { ...p.defaults, ...v }) : update(p.collection, edit.id, v); setEdit(null); }}/>)}
      {del && (<Confirm title="Delete this record?" text={p.deleteText?.(del) ?? "This action cannot be undone. Are you sure?"} onNo={() => setDel(null)} onYes={() => { remove(p.collection, del.id); setDel(null); }}/>)}
    </div>);
}
export function FormModal({ title, fields, initial, onSave, onClose, validate }) {
    const [v, setV] = useState(() => Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? (f.type === "select" ? f.options?.[0]?.value ?? "" : "")])));
    const [err, setErr] = useState({});
    const submit = (e) => {
        e.preventDefault();
        const er = {};
        const out = {};
        for (const f of fields) {
            const raw = typeof v[f.name] === "string" ? v[f.name].trim() : v[f.name];
            if (f.required && (raw === "" || raw == null))
                er[f.name] = "This field is required";
            else if (f.type === "number" && raw !== "") {
                const n = Number(raw);
                if (!Number.isFinite(n))
                    er[f.name] = "Enter a valid number";
                else if (f.min != null && n < f.min)
                    er[f.name] = `Minimum is ${f.min}`;
                else
                    out[f.name] = n;
            }
            else if (f.type === "email" && raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw))
                er[f.name] = "Enter a valid email address";
            else if (f.type === "tel" && raw && !/^01[3-9]\d{8}$/.test(raw))
                er[f.name] = "Enter a valid mobile number (01XXXXXXXXX)";
            else if (f.pattern && raw && !f.pattern.test(raw))
                er[f.name] = f.patternMsg ?? "Invalid format";
            else
                out[f.name] = raw;
        }
        Object.assign(er, Object.keys(er).length === 0 ? validate?.(out) : null);
        setErr(er);
        if (Object.keys(er).length === 0)
            onSave(out);
    };
    return (<Modal title={title} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (<label key={f.name} className={`block text-sm ${f.full || f.type === "textarea" ? "sm:col-span-2" : ""}`}>
            <span className="mb-1 block font-medium">{f.label}{f.required && <span className="text-red-600"> *</span>}</span>
            {f.type === "select" ? (<select className="inp" value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>) : f.type === "textarea" ? (<textarea className="inp min-h-24" maxLength={f.maxLength ?? 1000} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}/>) : (<input className="inp" type={f.type === "number" ? "number" : f.type ?? "text"} maxLength={f.maxLength ?? 200} value={v[f.name]} inputMode={f.type === "tel" ? "numeric" : undefined} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}/>)}
            {err[f.name] && <span className="mt-1 block text-xs text-red-600">{err[f.name]}</span>}
          </label>))}
        <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </Modal>);
}
