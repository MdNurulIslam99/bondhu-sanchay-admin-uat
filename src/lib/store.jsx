"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { seed, DEMO_PASSWORD } from "./seed";
import { uid } from "./format";
import { userCan } from "./permissions";
/**
 * Data layer: currently localStorage + sample data.
 * When the backend (separate repo) is ready, only the login/create/update/remove functions
 * in this file need to call fetch(); the UI does not have to change.
 */
const KEY = "bs_data_v8", SESSION = "bs_session_v2", LOCK = "bs_lock_v1";
const IDLE_MS = 30 * 60 * 1000, MAX_FAILS = 5, LOCK_MS = 5 * 60 * 1000;
const C = createContext(null);
export const useStore = () => useContext(C);
const fresh = () => ({ ...structuredClone(seed), audit: [] });
const safe = {
    get: (k) => { try {
        return localStorage.getItem(k);
    }
    catch {
        return null;
    } },
    set: (k, v) => { try {
        localStorage.setItem(k, v);
        return true;
    }
    catch {
        return false;
    } },
    del: (k) => { try {
        localStorage.removeItem(k);
    }
    catch { /* ignore */ } },
};
export function StoreProvider({ children }) {
    const [data, setData] = useState(fresh);
    const [session, setSession] = useState(null);
    const [ready, setReady] = useState(false);
    const [saveFailed, setSaveFailed] = useState(false);
    useEffect(() => {
        const raw = safe.get(KEY);
        if (raw) {
            try {
                setData(JSON.parse(raw));
            }
            catch { /* ignore */ }
        }
        const s = safe.get(SESSION);
        if (s) {
            try {
                const p = JSON.parse(s);
                if (Date.now() - p.last < IDLE_MS)
                    setSession(p);
            }
            catch { /* ignore */ }
        }
        setReady(true);
    }, []);
    const persist = (d) => { setData(d); setSaveFailed(!safe.set(KEY, JSON.stringify(d))); };
    const log = (d, action, target) => ({
        ...d,
        audit: [{ id: uid(), user: session?.name ?? "system", action, target, at: new Date().toISOString() }, ...d.audit].slice(0, 200),
    });
    const logout = useCallback(() => { safe.del(SESSION); setSession(null); }, []);
    // Session timeout: log out automatically after 30 minutes of inactivity
    useEffect(() => {
        if (!session)
            return;
        const touch = () => setSession((s) => {
            if (!s)
                return s;
            const n = { ...s, last: Date.now() };
            safe.set(SESSION, JSON.stringify(n));
            return n;
        });
        const t = setInterval(() => { if (Date.now() - session.last > IDLE_MS)
            logout(); }, 30000);
        window.addEventListener("click", touch);
        window.addEventListener("keydown", touch);
        return () => { clearInterval(t); window.removeEventListener("click", touch); window.removeEventListener("keydown", touch); };
    }, [session, logout]);
    const login = (email, pw) => {
        const lock = JSON.parse(safe.get(LOCK) || '{"n":0,"until":0}');
        if (lock.until > Date.now()) {
            const mins = Math.ceil((lock.until - Date.now()) / 60000);
            return { ok: false, error: `Too many failed attempts. Try again in ${mins} ${mins === 1 ? "minute" : "minutes"}.` };
        }
        const u = data.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.status === "active");
        if (!u || pw !== DEMO_PASSWORD) {
            const n = lock.n + 1;
            safe.set(LOCK, JSON.stringify(n >= MAX_FAILS ? { n: 0, until: Date.now() + LOCK_MS } : { n, until: 0 }));
            return { ok: false, error: "Incorrect email or password." };
        }
        safe.set(LOCK, JSON.stringify({ n: 0, until: 0 }));
        const s = { userId: u.id, name: u.name, role: u.role, email: u.email, last: Date.now() };
        safe.set(SESSION, JSON.stringify(s));
        setSession(s);
        return { ok: true };
    };
    const create = (c, row) => persist(log({ ...data, [c]: [{ ...row, id: uid() }, ...data[c]] }, "Created", c));
    const update = (c, id, patch) => {
        const next = { ...data, [c]: data[c].map((r) => (r.id === id ? { ...r, ...patch } : r)) };
        // Payments and withdrawals link to a member by name, so a rename must carry over to them.
        const oldName = c === "members" ? data.members.find((m) => m.id === id)?.name : null;
        if (oldName && patch.name && patch.name !== oldName) {
            const rename = (r) => (r.member === oldName ? { ...r, member: patch.name } : r);
            next.payments = data.payments.map(rename);
            next.withdrawals = data.withdrawals.map(rename);
        }
        // An investment name is its account: renaming one entry renames the account and its profit records.
        const oldAccount = c === "investments" ? data.investments.find((i) => i.id === id)?.name : null;
        if (oldAccount && patch.name && patch.name !== oldAccount) {
            next.investments = next.investments.map((i) => (i.name === oldAccount ? { ...i, name: patch.name } : i));
            const renameAccount = (r) => (r.account === oldAccount ? { ...r, account: patch.name } : r);
            next.profits = data.profits.map(renameAccount);
            next.projects = data.projects.map(renameAccount);
        }
        persist(log(next, "Updated", `${c}/${id}`));
    };
    const remove = (c, id) => {
        const next = { ...data, [c]: data[c].filter((r) => r.id !== id) };
        // A page's sections cannot exist without it.
        if (c === "pageNames")
            next.pageSections = data.pageSections.filter((s) => s.pageId !== id);
        // A deleted user's page permissions go with them.
        if (c === "users")
            next.userPermissions = data.userPermissions.filter((p) => p.userId !== id);
        persist(log(next, "Deleted", `${c}/${id}`));
    };
    const saveSettings = (s) => persist(log({ ...data, settings: s }, "Changed settings", "settings"));
    const savePermissions = (permissions) => persist(log({ ...data, permissions }, "Changed permissions", "permissions"));
    const resetDemo = () => persist(fresh());
    // Uses the user's current role and pages, so a Super Admin's change applies without logging in again.
    const can = (moduleKey, action = "view") => {
        if (!session)
            return false;
        const role = data.users.find((u) => u.id === session.userId)?.role ?? session.role;
        return userCan({ role, userId: session.userId, permissions: data.permissions, userPermissions: data.userPermissions }, moduleKey, action);
    };
    const value = useMemo(() => ({ ready, data, session, saveFailed, can, login, logout, create, update, remove, saveSettings, savePermissions, resetDemo }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, data, session, saveFailed, logout]);
    return <C.Provider value={value}>{children}</C.Provider>;
}
