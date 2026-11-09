"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ImageDrop from "./ImageDrop";
import RichTextEditor from "./RichTextEditor";
import { useStore } from "@/lib/store";
import { sanitizeHtml } from "@/lib/html";
import { SECTION_HEADERS, STATUS_OPTIONS, nextPosition } from "@/lib/webContent";

const LIST = "/admin/page-sections";

export function Field({ label, required, error, children, wide }) {
    return (<div className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <label className="block"><span className="mb-1 block font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>{children}</label>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>);
}

// Add and edit form for one Page Section. `row` is empty when adding.
export default function SectionForm({ row }) {
    const { data, can, create, update } = useStore();
    const router = useRouter();
    const editing = !!row;
    const [v, setV] = useState(() => ({
        pageId: row?.pageId ?? "", sectionHeader: row?.sectionHeader ?? "", title: row?.title ?? "", subTitle: row?.subTitle ?? "",
        status: row?.status ?? "active", position: row?.position ?? "", images: row?.images ?? [], description: row?.description ?? "",
    }));
    const [err, setErr] = useState({});
    const pages = data.pageNames.filter((p) => p.status === "active" || p.id === row?.pageId);
    const set = (patch) => {
        setV((cur) => ({ ...cur, ...patch }));
        // A field's error goes away as soon as the field changes.
        setErr((cur) => Object.fromEntries(Object.entries(cur).filter(([k]) => !(k in patch))));
    };
    // Choosing a page and section fills in the next free position, unless one was already typed.
    const choose = (patch) => {
        const next = { ...v, ...patch };
        set({ ...patch, ...(v.position === "" && next.pageId && next.sectionHeader ? { position: nextPosition(data.pageSections, next.pageId, next.sectionHeader, row?.id) } : {}) });
    };

    if (!can("page-sections", editing ? "update" : "create"))
        return (<div className="card mx-auto mt-10 max-w-md text-center">
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your role cannot {editing ? "edit" : "add"} page sections.</p>
        <Link href={LIST} className="btn-primary mt-4">Back to Page Sections</Link>
      </div>);

    const submit = (e) => {
        e.preventDefault();
        const position = Number(v.position);
        const er = {};
        if (!v.pageId)
            er.pageId = "Select a page";
        if (!v.sectionHeader)
            er.sectionHeader = "Select a section";
        if (!v.title.trim())
            er.title = "Section title is required";
        if (!Number.isInteger(position) || position < 1)
            er.position = "Enter a whole number, 1 or higher";
        setErr(er);
        if (Object.keys(er).length > 0)
            return;
        const values = { ...v, title: v.title.trim(), subTitle: v.subTitle.trim(), position, description: sanitizeHtml(v.description) };
        editing ? update("pageSections", row.id, values) : create("pageSections", values);
        router.push(LIST);
    };

    return (<div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={LIST} aria-label="Back to Page Sections" className="grid size-9 place-items-center rounded-full bg-brand text-white hover:bg-brand-dark"><ArrowLeft size={18}/></Link>
        <h1 className="text-xl font-bold sm:text-2xl">Page Section</h1>
      </div>
      <form onSubmit={submit} noValidate className="card overflow-hidden p-0">
        <h2 className="bg-brand-dark px-5 py-3 font-semibold text-white">{editing ? "Edit" : "Add"} Page Section</h2>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Page Name" required error={err.pageId}>
            <select className="inp" value={v.pageId} onChange={(e) => choose({ pageId: e.target.value })}>
              <option value="">Select page</option>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Section Header" required error={err.sectionHeader}>
            <select className="inp disabled:opacity-60" value={v.sectionHeader} disabled={!v.pageId} onChange={(e) => choose({ sectionHeader: e.target.value })}>
              <option value="">Select section</option>
              {SECTION_HEADERS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </Field>
          <Field label="Section Title" required error={err.title}>
            <input className="inp" maxLength={300} value={v.title} onChange={(e) => set({ title: e.target.value })}/>
          </Field>
          <Field label="Section Sub Title">
            <input className="inp" maxLength={300} value={v.subTitle} onChange={(e) => set({ subTitle: e.target.value })}/>
          </Field>
          <Field label="Status" required>
            <select className="inp" value={v.status} onChange={(e) => set({ status: e.target.value })}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Position" required error={err.position}>
            <input className="inp" type="number" min={1} step={1} value={v.position} onChange={(e) => set({ position: e.target.value })}/>
          </Field>
          <div className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Images</span>
            <ImageDrop label="Images" images={v.images} onChange={(images) => set({ images })}/>
          </div>
          <div className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Description</span>
            <RichTextEditor label="Description" value={v.description} onChange={(description) => set({ description })}/>
          </div>
        </div>
        <div className="flex justify-between gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <Link href={LIST} className="btn-ghost">Back</Link>
          <button type="submit" className="btn-primary">{editing ? "Update" : "Create"}</button>
        </div>
      </form>
    </div>);
}
