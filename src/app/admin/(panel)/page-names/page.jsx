"use client";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { STATUS_OPTIONS } from "@/lib/webContent";

export default function Page() {
    const { data } = useStore();
    const sectionCount = (id) => data.pageSections.filter((s) => s.pageId === id).length;
    const isDuplicate = (name, row) => data.pageNames.some((p) => p.id !== row?.id && p.name.toLowerCase() === name.toLowerCase());
    return (<Resource collection="pageNames" module="page-names" title="Page Names" singular="Page" defaults={{ status: "active" }} filter={{ key: "status", label: "Status", all: "All statuses", options: STATUS_OPTIONS }} validate={(v, row) => (isDuplicate(v.name, row) ? { name: "A page with this name already exists" } : null)} deleteText={(p) => {
            const n = sectionCount(p.id);
            return n > 0 ? `"${p.name}" and its ${n} ${n === 1 ? "section" : "sections"} will be deleted. This cannot be undone.` : `"${p.name}" will be deleted. This cannot be undone.`;
        }} columns={[
            { key: "name", label: "Page Name" },
            { key: "sections", label: "Sections", noSort: true, render: (p) => sectionCount(p.id), csv: (p) => String(sectionCount(p.id)) },
            { key: "status", label: "Status", render: (p) => <Badge value={p.status}/> },
        ]} fields={[
            { name: "name", label: "Page Name", required: true, full: true },
            { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
        ]}/>);
}
