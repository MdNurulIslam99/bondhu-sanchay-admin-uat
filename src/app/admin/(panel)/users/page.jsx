"use client";
import Resource from "@/components/Resource";
import { Badge } from "@/components/ui";
import { ROLES, ROLE_LABEL } from "@/lib/permissions";
const roles = ROLES.map((r) => ({ value: r.key, label: r.label }));
export default function Page() {
    return (<Resource collection="users" title="Users" singular="User" defaults={{ role: "viewer", status: "active" }} filter={{ key: "role", label: "Role", all: "All roles", options: roles }} columns={[
            { key: "name", label: "Name" }, { key: "email", label: "Email" },
            { key: "role", label: "Role", render: (u) => ROLE_LABEL[u.role] },
            { key: "status", label: "Status", render: (u) => <Badge value={u.status}/> },
        ]} fields={[
            { name: "name", label: "Name", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "role", label: "Role", type: "select", options: roles },
            { name: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
        ]}/>);
}
