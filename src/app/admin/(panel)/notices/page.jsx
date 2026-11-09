"use client";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/format";
export default function Page() {
    return (<Resource collection="notices" title="Notices & Announcements" singular="Notice" defaults={{ published: "yes", date: new Date().toISOString().slice(0, 10) }} columns={[
            { key: "title", label: "Title" }, { key: "date", label: "Date", render: (r) => formatDate(r.date) },
            { key: "published", label: "Status", render: (r) => <Badge value={r.published}/> },
        ]} fields={[
            { name: "title", label: "Title", required: true, full: true },
            { name: "body", label: "Details", type: "textarea", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "published", label: "Publishing Status", type: "select", options: [{ value: "yes", label: "Published" }, { value: "no", label: "Draft" }] },
        ]}/>);
}
