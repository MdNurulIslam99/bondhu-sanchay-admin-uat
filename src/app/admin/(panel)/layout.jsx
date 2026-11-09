"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Briefcase, Coins, FileText, HandCoins, HelpCircle, KeyRound, Layers, LayoutDashboard, LogOut, Mail, Megaphone, Menu, Moon, ScrollText, Settings, ShieldCheck, Sprout, Sun, TrendingUp, UserCog, Users, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { MODULES, ROLE_LABEL } from "@/lib/permissions";

const ICONS = {
    dashboard: LayoutDashboard, members: Users, payments: Wallet, dues: AlertCircle, investments: TrendingUp, projects: Briefcase, profits: Coins, withdrawals: HandCoins,
    "page-names": FileText, "page-sections": Layers, faqs: HelpCircle, notices: Megaphone, messages: Mail,
    users: UserCog, "user-permissions": KeyRound, roles: ShieldCheck, audit: ScrollText, settings: Settings,
};
const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function PanelLayout({ children }) {
    const { ready, session, logout, data, can, saveFailed } = useStore();
    const path = usePathname();
    const r = useRouter();
    const [open, setOpen] = useState(false);
    const [dark, setDark] = useState(false);
    useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
    useEffect(() => { if (ready && !session)
        r.replace("/admin/login"); }, [ready, session, r]);
    useEffect(() => setOpen(false), [path]);
    if (!ready || !session)
        return <p className="p-6 text-slate-500">Loading…</p>;
    const toggle = () => {
        const d = !dark;
        setDark(d);
        document.documentElement.classList.toggle("dark", d);
        try {
            localStorage.setItem("bs_theme", d ? "dark" : "light");
        }
        catch { /* ignore */ }
    };
    const items = MODULES.filter((m) => can(m.key));
    const groups = [...new Set(items.map((m) => m.group))];
    const isCurrent = (m) => path === `/admin/${m.key}` || path.startsWith(`/admin/${m.key}/`);
    const current = MODULES.find(isCurrent);
    const allowed = !current || can(current.key);
    const newMsgs = data.messages.filter((m) => m.status === "new").length;
    return (<div className="min-h-screen lg:flex">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)}/>}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-brand-dark text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px_4px_12px_4px] bg-brand text-gold"><Sprout size={23}/></span>
          <span className="min-w-0 text-[15px] font-bold leading-tight text-gold">{data.settings.orgName}</span>
        </div>
        <nav aria-label="Admin menu" className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {groups.map((group) => (<div key={group}>
              <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">{group}</div>
              <div className="space-y-0.5">
                {items.filter((m) => m.group === group).map((m) => {
                const Icon = ICONS[m.key];
                const active = isCurrent(m);
                return (<Link key={m.key} href={`/admin/${m.key}`} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-gold font-semibold text-brand-dark" : "text-white/85 hover:bg-white/10 hover:text-white"}`}>
                      <Icon size={17}/>{m.label}
                      {m.key === "messages" && newMsgs > 0 && <span className={`ml-auto rounded-full px-2 text-xs font-semibold ${active ? "bg-brand-dark text-gold" : "bg-gold text-brand-dark"}`}>{newMsgs}</span>}
                    </Link>);
            })}
              </div>
            </div>))}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-white/10 p-3">
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-brand-dark">{initials(session.name)}</span>
          <span className="min-w-0 text-sm leading-tight">
            <span className="block truncate font-medium">{session.name}</span>
            <span className="block truncate text-xs text-white/60">{ROLE_LABEL[session.role]}</span>
          </span>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex min-w-0 items-center gap-3">
            <button className="btn-ghost px-2.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={18}/></button>
            <div className="truncate text-sm text-slate-500 dark:text-slate-400">{current ? <>{current.group} <span aria-hidden="true">/</span> <span className="font-medium text-slate-800 dark:text-slate-100">{current.label}</span></> : `Welcome, ${session.name}`}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="btn-ghost px-2.5" onClick={toggle} aria-label="Toggle theme">{dark ? <Sun size={17}/> : <Moon size={17}/>}</button>
            <button className="btn-ghost" onClick={() => { logout(); r.replace("/admin/login"); }}><LogOut size={16}/><span className="hidden sm:inline">Log out</span></button>
          </div>
        </header>
        {saveFailed && <div role="alert" className="border-b border-red-200 bg-red-50 px-6 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">This browser&apos;s storage is full, so your last change will be lost on reload. Remove some section images and save again.</div>}
        <main className="p-4 sm:p-6">
          {allowed ? children : (<div className="card mx-auto mt-10 max-w-md text-center">
              <h1 className="text-lg font-semibold">Access denied</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your role ({ROLE_LABEL[session.role]}) does not have permission to view this page.</p>
              {items[0]
                ? <Link href={`/admin/${items[0].key}`} className="btn-primary mt-4">Go to {items[0].label}</Link>
                : <p className="mt-3 text-sm">No pages are assigned to your role. Please ask the Super Admin.</p>}
            </div>)}
        </main>
      </div>
    </div>);
}
