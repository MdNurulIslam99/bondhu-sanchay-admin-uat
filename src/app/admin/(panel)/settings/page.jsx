"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { seed } from "@/lib/seed";
import { Confirm } from "@/components/ui";
export default function Page() {
    const { data, saveSettings, resetDemo, can } = useStore();
    const canEdit = can("settings", "update");
    const [s, setS] = useState(data.settings);
    const [msg, setMsg] = useState("");
    const [reset, setReset] = useState(false);
    const num = (k) => (e) => setS({ ...s, [k]: Math.max(0, Number(e.target.value)) });
    const L = (t, el) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{el}</label>;
    return (<div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Settings</h1>
      <form className="card grid gap-3 sm:grid-cols-2" onSubmit={(e) => {
            e.preventDefault();
            if (!s.orgName.trim() || s.dueDay < 1 || s.dueDay > 28 || s.monthlyAmount < 1) {
                setMsg("Please enter valid details (due day must be 1–28).");
                return;
            }
            saveSettings(s);
            setMsg("Saved ✓");
        }}>
        <div className="sm:col-span-2">{L("Organization Name", <input className="inp" maxLength={100} value={s.orgName} onChange={(e) => setS({ ...s, orgName: e.target.value })}/>)}</div>
        <div className="sm:col-span-2">{L("About", <textarea className="inp min-h-24" maxLength={500} value={s.about} onChange={(e) => setS({ ...s, about: e.target.value })}/>)}</div>
        {L("Monthly Deposit (৳)", <input className="inp" type="number" min={1} value={s.monthlyAmount} onChange={num("monthlyAmount")}/>)}
        {L("Deposit Due Day (of the month)", <input className="inp" type="number" min={1} max={28} value={s.dueDay} onChange={num("dueDay")}/>)}
        {L("Late Fine (৳)", <input className="inp" type="number" min={0} value={s.fine} onChange={num("fine")}/>)}
        {L("Contact Number", <input className="inp" maxLength={20} value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })}/>)}
        <div className="flex items-center justify-between gap-2 sm:col-span-2">
          <span className="text-sm text-emerald-700">{msg}</span>
          {canEdit ? <button className="btn-primary">Save</button> : <span className="text-sm text-slate-500">Your role can view these settings but not change them.</span>}
        </div>
      </form>
      {canEdit && (<div className="card mt-4">
          <h2 className="mb-2 font-semibold">Demo Data</h2>
          <p className="mb-3 text-sm text-slate-500">Discard all changes and return to the original sample data.</p>
          <button className="btn-danger" onClick={() => setReset(true)}>Reset Data</button>
        </div>)}
      {reset && <Confirm title="Reset data?" text="All changes will be lost." yesLabel="Reset" onNo={() => setReset(false)} onYes={() => { resetDemo(); setReset(false); setS(seed.settings); }}/>}
    </div>);
}
