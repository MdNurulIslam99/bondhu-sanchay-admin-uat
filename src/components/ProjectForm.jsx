"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ImageDrop from "./ImageDrop";
import RichTextEditor from "./RichTextEditor";
import { Field } from "./SectionForm";
import { BUSINESS_TYPES } from "@/data/projects";
import { useStore } from "@/lib/store";
import { sanitizeHtml } from "@/lib/html";
import { investmentAccounts } from "@/lib/investments";
import { taka } from "@/lib/format";

const LIST = "/admin/projects";
const STATUS = [{ value: "running", label: "Running" }, { value: "completed", label: "Completed" }, { value: "planned", label: "Planned" }];

// Add and edit form for one investment project. `row` is empty when adding.
export default function ProjectForm({ row }) {
    const { data, can, create, update } = useStore();
    const router = useRouter();
    const editing = !!row;
    const [v, setV] = useState(() => ({
        name: row?.name ?? "", account: row?.account ?? "", businessType: row?.businessType ?? "", status: row?.status ?? "running",
        startDate: row?.startDate ?? "", location: row?.location ?? "", contactPerson: row?.contactPerson ?? "", contactMobile: row?.contactMobile ?? "",
        showOnWebsite: row?.showOnWebsite ?? "yes", summary: row?.summary ?? "", images: row?.images ?? [], description: row?.description ?? "",
    }));
    const [err, setErr] = useState({});
    const accounts = investmentAccounts(data.investments, data.profits);
    const linked = accounts.find((a) => a.name === v.account);
    const set = (patch) => {
        setV((cur) => ({ ...cur, ...patch }));
        setErr((cur) => Object.fromEntries(Object.entries(cur).filter(([k]) => !(k in patch))));
    };
    const input = (key) => ({ value: v[key], onChange: (e) => set({ [key]: e.target.value }) });

    if (!can("projects", editing ? "update" : "create"))
        return (<div className="card mx-auto mt-10 max-w-md text-center">
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your role cannot {editing ? "edit" : "add"} projects.</p>
        <Link href={LIST} className="btn-primary mt-4">Back to Projects</Link>
      </div>);

    const submit = (e) => {
        e.preventDefault();
        const name = v.name.trim();
        const mobile = v.contactMobile.trim();
        const er = {};
        if (!name)
            er.name = "Project name is required";
        else if (data.projects.some((p) => p.id !== row?.id && p.name.toLowerCase() === name.toLowerCase()))
            er.name = "A project with this name already exists";
        if (!v.account)
            er.account = "Select the investor";
        if (!v.businessType)
            er.businessType = "Select a business type";
        if (!v.startDate)
            er.startDate = "Start date is required";
        if (mobile && !/^01[3-9]\d{8}$/.test(mobile))
            er.contactMobile = "Enter a valid mobile number (01XXXXXXXXX)";
        setErr(er);
        if (Object.keys(er).length > 0)
            return;
        const values = { ...v, name, contactMobile: mobile, location: v.location.trim(), contactPerson: v.contactPerson.trim(), summary: v.summary.trim(), description: sanitizeHtml(v.description) };
        editing ? update("projects", row.id, values) : create("projects", values);
        router.push(LIST);
    };

    return (<div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={LIST} aria-label="Back to Projects" className="grid size-9 place-items-center rounded-full bg-brand text-white hover:bg-brand-dark"><ArrowLeft size={18}/></Link>
        <h1 className="text-xl font-bold sm:text-2xl">Project</h1>
      </div>
      <form onSubmit={submit} noValidate className="card overflow-hidden p-0">
        <h2 className="bg-brand-dark px-5 py-3 font-semibold text-white">{editing ? "Edit" : "Add"} Project</h2>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Project Name" required error={err.name}><input className="inp" maxLength={200} {...input("name")}/></Field>
          <Field label="Investor" required error={err.account}>
            <select className="inp" {...input("account")}>
              <option value="">Select investor</option>
              {accounts.map((a) => <option key={a.name} value={a.name}>{a.name}</option>)}
            </select>
          </Field>
          {linked && (<p className="rounded-lg bg-brand/5 px-3 py-2 text-sm sm:col-span-2 dark:bg-gold/10">
              {linked.name}: {taka(linked.invested)} invested, {taka(linked.monthlyProfit)} a month, {taka(linked.collected)} profit collected. These figures come from <Link href="/admin/investments" className="font-medium underline">Investments</Link>.
            </p>)}
          <Field label="Business Type" required error={err.businessType}>
            <select className="inp" {...input("businessType")}>
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Status" required>
            <select className="inp" {...input("status")}>
              {STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Start Date" required error={err.startDate}><input className="inp" type="date" {...input("startDate")}/></Field>
          <Field label="Location"><input className="inp" maxLength={200} {...input("location")}/></Field>
          <Field label="Contact Person"><input className="inp" maxLength={200} {...input("contactPerson")}/></Field>
          <Field label="Contact Mobile" error={err.contactMobile}><input className="inp" type="tel" inputMode="numeric" maxLength={11} {...input("contactMobile")}/></Field>
          <Field label="Show on Website" required>
            <select className="inp" {...input("showOnWebsite")}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Short Summary" wide><input className="inp" maxLength={200} {...input("summary")}/></Field>
          <div className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Images</span>
            <ImageDrop label="Images" images={v.images} onChange={(images) => set({ images })}/>
          </div>
          <div className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Details</span>
            <RichTextEditor label="Details" value={v.description} onChange={(description) => set({ description })}/>
          </div>
        </div>
        <div className="flex justify-between gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <Link href={LIST} className="btn-ghost">Back</Link>
          <button type="submit" className="btn-primary">{editing ? "Update" : "Create"}</button>
        </div>
      </form>
    </div>);
}
