"use client";
import { useMemo, useState } from "react";
import Resource from "@/components/Resource";
import { Badge, Modal } from "@/components/ui";
import { useStore } from "@/lib/store";
import { MODULES, ROLE_LABEL } from "@/lib/permissions";
import { STATUS_OPTIONS } from "@/lib/webContent";

const ASSIGNABLE = MODULES.filter((m) => !m.superOnly);
const GROUPS = [...new Set(ASSIGNABLE.map((m) => m.group))];
const pageLabel = (key) => MODULES.find((m) => m.key === key)?.label ?? key;

function PermissionForm({ row, users, onSave, onClose }) {
    const [userId, setUserId] = useState(row?.userId ?? "");
    const [status, setStatus] = useState(row?.status ?? "active");
    const [pages, setPages] = useState(row?.pages ?? []);
    const [err, setErr] = useState({});
    const allTicked = pages.length === ASSIGNABLE.length;
    const toggle = (key) => {
        setErr((e) => ({ ...e, pages: undefined }));
        setPages((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
    };
    const submit = (e) => {
        e.preventDefault();
        const er = {};
        if (!userId)
            er.userId = "Select a user";
        if (pages.length === 0)
            er.pages = "Select at least one page";
        setErr(er);
        if (!er.userId && !er.pages)
            onSave({ userId, status, pages: ASSIGNABLE.map((m) => m.key).filter((k) => pages.includes(k)) });
    };
    return (<Modal title={row ? "Edit User Permission" : "Add New User Permission"} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm"><span className="mb-1 block font-medium">Select User<span className="text-red-600"> *</span></span>
            <select className="inp disabled:opacity-60" value={userId} disabled={!!row} onChange={(e) => { setUserId(e.target.value); setErr((c) => ({ ...c, userId: undefined })); }}>
              <option value="">Select user</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({ROLE_LABEL[u.role]})</option>)}
            </select>
            {err.userId && <span className="mt-1 block text-xs text-red-600">{err.userId}</span>}
          </label>
          <label className="block text-sm"><span className="mb-1 block font-medium">Select Status<span className="text-red-600"> *</span></span>
            <select className="inp" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>

        <fieldset>
          <div className="mb-2 flex items-center justify-between gap-2">
            <legend className="text-sm font-medium">Pages<span className="text-red-600"> *</span></legend>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-brand" checked={allTicked} onChange={() => setPages(allTicked ? [] : ASSIGNABLE.map((m) => m.key))}/>Select all</label>
          </div>
          <div className="space-y-3">
            {GROUPS.map((group) => (<div key={group}>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{group}</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ASSIGNABLE.filter((m) => m.group === group).map((m) => (<label key={m.key} className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-brand" checked={pages.includes(m.key)} onChange={() => toggle(m.key)}/>{m.label}</label>))}
                </div>
              </div>))}
          </div>
          {err.pages && <p className="mt-2 text-xs text-red-600">{err.pages}</p>}
        </fieldset>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">{row ? "Update Permission" : "Add Permission"}</button>
        </div>
      </form>
    </Modal>);
}

export default function Page() {
    const { data, create, update } = useStore();
    const [form, setForm] = useState(null); // "new" or the row being edited
    const userOf = (r) => data.users.find((u) => u.id === r.userId);
    const staff = data.users.filter((u) => u.role !== "super_admin");
    const unassigned = staff.filter((u) => !data.userPermissions.some((p) => p.userId === u.id));
    const filter = useMemo(() => ({ key: "status", label: "Status", all: "All statuses", options: STATUS_OPTIONS }), []);
    const search = (r) => `${userOf(r)?.name} ${userOf(r)?.email} ${r.pages.map(pageLabel).join(" ")}`;
    const save = (values) => {
        form === "new" ? create("userPermissions", values) : update("userPermissions", form.id, { status: values.status, pages: values.pages });
        setForm(null);
    };
    const formUsers = form && form !== "new" ? staff.filter((u) => u.id === form.userId) : unassigned;

    return (<>
      <Resource collection="userPermissions" module="user-permissions" title="User Permissions" singular="Permission" filter={filter} search={search} onCreate={() => setForm("new")} onEdit={setForm} deleteText={(r) => `${userOf(r)?.name ?? "This user"} will not see any pages until a new permission is added.`} top={<div className="mb-4 space-y-2 text-sm">
            <p className="rounded-lg bg-brand/5 px-3 py-2 dark:bg-gold/10">Each user sees only their ticked pages after logging in. Super Admin always sees every page, and Users, Role Actions and User Permissions stay Super Admin only.</p>
            {unassigned.length > 0 && <p role="status" className="rounded-lg bg-amber-100 px-3 py-2 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">No pages yet: {unassigned.map((u) => u.name).join(", ")}. They will see nothing until you add a permission.</p>}
          </div>} columns={[
            { key: "user", label: "User", noSort: true, render: (r) => <span className="font-medium">{userOf(r)?.name ?? "Deleted user"}</span>, csv: (r) => userOf(r)?.name ?? "" },
            { key: "email", label: "Email", noSort: true, render: (r) => userOf(r)?.email ?? "-", csv: (r) => userOf(r)?.email ?? "" },
            { key: "role", label: "Role", noSort: true, render: (r) => ROLE_LABEL[userOf(r)?.role] ?? "-", csv: (r) => ROLE_LABEL[userOf(r)?.role] ?? "" },
            { key: "pages", label: "Pages", noSort: true, render: (r) => (<span className="flex max-w-md flex-wrap gap-1" title={r.pages.map(pageLabel).join(", ")}>
                {r.pages.slice(0, 4).map((k) => <span key={k} className="whitespace-nowrap rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">{pageLabel(k)}</span>)}
                {r.pages.length > 4 && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">+{r.pages.length - 4} more</span>}
              </span>), csv: (r) => r.pages.map(pageLabel).join("; ") },
            { key: "status", label: "Status", render: (r) => <Badge value={r.status}/> },
        ]} fields={[
            { name: "userId", label: "User", view: (r) => userOf(r)?.name ?? "-" },
            { name: "role", label: "Role", view: (r) => ROLE_LABEL[userOf(r)?.role] ?? "-" },
            { name: "status", label: "Status", view: (r) => <Badge value={r.status}/> },
            { name: "pages", label: "Pages", view: (r) => r.pages.map(pageLabel).join(", ") },
        ]}/>
      {form && <PermissionForm key={form === "new" ? "new" : form.id} row={form === "new" ? null : form} users={formUsers} onSave={save} onClose={() => setForm(null)}/>}
    </>);
}
