"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Thumb } from "@/components/ImageDrop";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { stripHtml } from "@/lib/html";
import { downloadSiteContent, sectionOrder } from "@/lib/webContent";

export default function Page() {
    const { data } = useStore();
    const router = useRouter();
    const pageName = (id) => data.pageNames.find((p) => p.id === id)?.name ?? "-";
    const order = useMemo(() => sectionOrder(data.pageNames), [data.pageNames]);
    const pageFilter = useMemo(() => ({ key: "pageId", label: "Page", all: "All Pages", options: data.pageNames.map((p) => ({ value: p.id, label: p.name })) }), [data.pageNames]);
    return (<Resource collection="pageSections" module="page-sections" title="Page Sections" singular="Section" compactActions order={order} filter={pageFilter} onCreate={() => router.push("/admin/page-sections/new")} onEdit={(s) => router.push(`/admin/page-sections/${s.id}`)} search={(s) => `${pageName(s.pageId)} ${s.sectionHeader} ${s.title} ${s.subTitle} ${stripHtml(s.description)}`} actions={<button className="btn-ghost" onClick={() => downloadSiteContent(data.pageNames, data.pageSections, data.faqs, data.projects)}>Export for Website</button>} columns={[
            { key: "images", label: "Image", noSort: true, render: (s) => <Thumb src={s.images?.[0]} alt={s.title}/>, csv: (s) => String(s.images?.length ?? 0) },
            { key: "pageId", label: "Page Name", render: (s) => pageName(s.pageId), csv: (s) => pageName(s.pageId) },
            { key: "sectionHeader", label: "Section Header" },
            { key: "title", label: "Section Title", render: (s) => <span className="line-clamp-2 min-w-48 max-w-xs">{s.title}</span> },
            { key: "subTitle", label: "Section Sub Title", render: (s) => <span className="line-clamp-2 max-w-52">{s.subTitle || "-"}</span> },
            { key: "description", label: "Description", noSort: true, render: (s) => <span className="line-clamp-2 min-w-48 max-w-xs text-slate-500 dark:text-slate-400">{stripHtml(s.description) || "-"}</span>, csv: (s) => stripHtml(s.description) },
            { key: "status", label: "Status", render: (s) => <Badge value={s.status}/> },
        ]} fields={[
            { name: "pageId", label: "Page Name", view: (s) => pageName(s.pageId) },
            { name: "sectionHeader", label: "Section Header" },
            { name: "title", label: "Section Title" },
            { name: "subTitle", label: "Section Sub Title" },
            { name: "status", label: "Status", view: (s) => <Badge value={s.status}/> },
            { name: "position", label: "Position" },
            { name: "images", label: "Images", view: (s) => (s.images?.length ? <div className="flex flex-wrap gap-2">{s.images.map((src, i) => <Thumb key={i} src={src} alt={`${s.title} ${i + 1}`}/>)}</div> : "-") },
            { name: "description", label: "Description", view: (s) => stripHtml(s.description) || "-" },
        ]}/>);
}
