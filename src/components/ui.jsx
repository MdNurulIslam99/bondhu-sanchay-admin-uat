"use client";
import { useEffect } from "react";
const TONE = {
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    blue: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};
const STATUS = {
    active: ["Active", "green"], inactive: ["Inactive", "gray"], pending: ["Pending", "amber"],
    verified: ["Verified", "green"], reversed: ["Reversed", "red"],
    running: ["Running", "blue"], completed: ["Completed", "green"], planned: ["Planned", "gray"],
    approved: ["Approved", "blue"], paid: ["Paid", "green"], rejected: ["Rejected", "red"],
    new: ["New", "amber"], read: ["Read", "gray"], yes: ["Published", "green"], no: ["Draft", "gray"],
    collected: ["Collected", "green"], partial: ["Partly collected", "amber"], upcoming: ["Upcoming", "gray"],
};
export const statusLabel = (s) => STATUS[s]?.[0] ?? s;
export function Badge({ value }) {
    const [label, tone] = STATUS[value] ?? [value, "gray"];
    return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[tone]}`}>{label}</span>;
}
export function Modal({ title, onClose, children, wide }) {
    useEffect(() => {
        const k = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", k);
        document.body.style.overflow = "hidden";
        return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
    }, [onClose]);
    return (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl dark:bg-slate-900 ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-xl leading-none hover:bg-slate-100 dark:hover:bg-slate-800">×</button>
        </div>
        {children}
      </div>
    </div>);
}
export function Confirm({ title, text, onYes, onNo, yesLabel = "Delete" }) {
    return (<Modal title={title} onClose={onNo}>
      <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">{text}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onNo}>Cancel</button>
        <button className="btn-danger" onClick={onYes}>{yesLabel}</button>
      </div>
    </Modal>);
}
export function Stat({ label, value, hint, icon: Icon }) {
    return (<div className="card flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
        <div className="mt-1 text-2xl font-bold text-brand dark:text-gold">{value}</div>
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      </div>
      {Icon && <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand dark:bg-gold/15 dark:text-gold"><Icon size={20}/></span>}
    </div>);
}
