"use client";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
const ST = [{ value: "new", label: "New" }, { value: "read", label: "Read" }];
export default function Page() {
    const { update } = useStore();
    return (<Resource collection="messages" title="Contact Messages" singular="Message" filter={{ key: "status", label: "Status", all: "All statuses", options: ST }} columns={[
            { key: "name", label: "Name" }, { key: "phone", label: "Mobile" },
            { key: "message", label: "Message", render: (r) => <span className="line-clamp-1 max-w-xs">{r.message}</span> },
            { key: "date", label: "Date", render: (r) => formatDate(r.date) },
            { key: "status", label: "Status", render: (r) => <Badge value={r.status}/> },
        ]} fields={[
            { name: "name", label: "Name", required: true },
            { name: "phone", label: "Mobile", type: "tel", required: true },
            { name: "message", label: "Message", type: "textarea", required: true },
            { name: "status", label: "Status", type: "select", options: ST },
        ]} rowActions={(r) => r.status === "new" ? [{ label: "Mark read", onClick: () => update("messages", r.id, { status: "read" }) }] : []}/>);
}
