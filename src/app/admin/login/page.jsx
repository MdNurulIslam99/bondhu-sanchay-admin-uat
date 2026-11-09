"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
import { useStore } from "@/lib/store";
export default function Login() {
    const { ready, session, login } = useStore();
    const r = useRouter();
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");
    useEffect(() => { if (ready && session)
        r.replace("/admin"); }, [ready, session, r]);
    return (<div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-dark p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5 text-lg font-bold text-gold">
          <span className="grid size-10 place-items-center rounded-[12px_4px_12px_4px] bg-brand"><Sprout size={23}/></span>
          Bondhu Sanchay Parishad
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Save together,<br />grow together.</h1>
          <p className="mt-3 max-w-md text-white/70">Manage members, monthly collections, dues, investments and website content from one place.</p>
        </div>
        <p className="text-xs text-white/50">Admin Panel</p>
      </div>
      <div className="flex items-center justify-center p-4">
        <form className="card w-full max-w-sm space-y-4 p-6" onSubmit={(e) => {
            e.preventDefault();
            const res = login(email, pw);
            if (!res.ok)
                setErr(res.error);
            else
                r.replace("/admin");
        }}>
          <div>
            <div className="text-2xl font-bold">Welcome back</div>
            <div className="text-sm text-slate-500">Log in to the admin panel</div>
          </div>
          {err && <div role="alert" className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{err}</div>}
          <label className="block text-sm"><span className="mb-1 block font-medium">Email</span>
            <input className="inp" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)}/></label>
          <label className="block text-sm"><span className="mb-1 block font-medium">Password</span>
            <input className="inp" type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)}/></label>
          <button className="btn-primary w-full">Log in</button>
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
            <b>Demo accounts</b> (password: Demo@12345)<br />
            super@bondhu.test · admin@bondhu.test<br />accountant@bondhu.test · viewer@bondhu.test
          </div>
        </form>
      </div>
    </div>);
}
