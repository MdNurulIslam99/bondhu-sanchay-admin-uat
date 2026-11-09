"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Thumb } from "@/components/ImageDrop";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { stripHtml } from "@/lib/html";
import { investmentAccounts } from "@/lib/investments";
import { formatDate, taka } from "@/lib/format";

const STATUS = [{ value: "running", label: "Running" }, { value: "completed", label: "Completed" }, { value: "planned", label: "Planned" }];
const newestFirst = (a, b) => String(b.startDate).localeCompare(String(a.startDate));

export default function Page() {
    const { data } = useStore();
    const router = useRouter();
    const accounts = useMemo(() => Object.fromEntries(investmentAccounts(data.investments, data.profits).map((a) => [a.name, a])), [data.investments, data.profits]);
    const search = (p) => `${p.name} ${p.account} ${p.businessType} ${p.location} ${p.contactPerson} ${p.summary} ${stripHtml(p.description)}`;
    return (<Resource collection="projects" title="Projects" singular="Project" compactActions order={newestFirst} search={search} filter={{ key: "status", label: "Status", all: "All statuses", options: STATUS }} onCreate={() => router.push("/admin/projects/new")} onEdit={(p) => router.push(`/admin/projects/${p.id}`)} deleteText={(p) => `"${p.name}" will be deleted. ${p.account}'s investment and profit records are kept. This cannot be undone.`} columns={[
            { key: "images", label: "Image", noSort: true, render: (p) => <Thumb src={p.images?.[0]} alt={p.name}/>, csv: (p) => String(p.images?.length ?? 0) },
            { key: "name", label: "Project Name", render: (p) => <span className="block min-w-48 font-medium">{p.name}<span className="mt-0.5 line-clamp-1 max-w-xs text-xs font-normal text-slate-500 dark:text-slate-400">{p.summary}</span></span>, csv: (p) => p.name },
            { key: "account", label: "Investor", render: (p) => (accounts[p.account] ? <Link href={`/admin/investments/${encodeURIComponent(p.account)}`} className="text-brand hover:underline dark:text-gold">{p.account}</Link> : p.account) },
            { key: "businessType", label: "Business Type" },
            { key: "location", label: "Location", render: (p) => p.location || "-" },
            { key: "startDate", label: "Start Date", render: (p) => <span className="whitespace-nowrap">{formatDate(p.startDate)}</span> },
            { key: "invested", label: "Invested", noSort: true, render: (p) => <span className="whitespace-nowrap">{taka(accounts[p.account]?.invested ?? 0)}</span>, csv: (p) => String(accounts[p.account]?.invested ?? 0) },
            { key: "status", label: "Status", render: (p) => <Badge value={p.status}/> },
        ]} fields={[
            { name: "name", label: "Project Name" },
            { name: "account", label: "Investor" },
            { name: "businessType", label: "Business Type" },
            { name: "status", label: "Status", view: (p) => <Badge value={p.status}/> },
            { name: "startDate", label: "Start Date", view: (p) => formatDate(p.startDate) },
            { name: "location", label: "Location", view: (p) => p.location || "-" },
            { name: "contactPerson", label: "Contact Person", view: (p) => p.contactPerson || "-" },
            { name: "contactMobile", label: "Contact Mobile", view: (p) => p.contactMobile || "-" },
            { name: "showOnWebsite", label: "Show on Website", view: (p) => (p.showOnWebsite === "yes" ? "Yes" : "No") },
            { name: "summary", label: "Short Summary", view: (p) => p.summary || "-" },
            { name: "images", label: "Images", view: (p) => (p.images?.length ? <div className="flex flex-wrap gap-2">{p.images.map((src, i) => <Thumb key={i} src={src} alt={`${p.name} ${i + 1}`}/>)}</div> : "-") },
            { name: "description", label: "Details", view: (p) => stripHtml(p.description) || "-" },
        ]}/>);
}
