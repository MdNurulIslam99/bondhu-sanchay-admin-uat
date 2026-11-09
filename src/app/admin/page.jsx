"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MODULES } from "@/lib/permissions";
// Sends each user to the first page their role is allowed to see.
export default function AdminIndex() {
    const { ready, session, can } = useStore();
    const r = useRouter();
    useEffect(() => {
        if (!ready)
            return;
        const first = session && MODULES.find((m) => can(m.key));
        r.replace(session ? `/admin/${first?.key ?? "dashboard"}` : "/admin/login");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, session, r]);
    return <p className="p-6 text-slate-500">Loading…</p>;
}
