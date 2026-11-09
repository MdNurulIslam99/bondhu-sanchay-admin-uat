"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import { useStore } from "@/lib/store";

export default function Page() {
    const { id } = useParams();
    const { data } = useStore();
    const row = data.projects.find((p) => p.id === id);
    if (!row)
        return (<div className="card mx-auto mt-10 max-w-md text-center">
        <h1 className="text-lg font-semibold">Project not found</h1>
        <Link href="/admin/projects" className="btn-primary mt-4">Back to Projects</Link>
      </div>);
    return <ProjectForm key={row.id} row={row}/>;
}
