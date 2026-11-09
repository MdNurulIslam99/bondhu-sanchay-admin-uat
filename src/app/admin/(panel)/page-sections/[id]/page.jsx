"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import SectionForm from "@/components/SectionForm";
import { useStore } from "@/lib/store";

export default function Page() {
    const { id } = useParams();
    const { data } = useStore();
    const row = data.pageSections.find((s) => s.id === id);
    if (!row)
        return (<div className="card mx-auto mt-10 max-w-md text-center">
        <h1 className="text-lg font-semibold">Section not found</h1>
        <Link href="/admin/page-sections" className="btn-primary mt-4">Back to Page Sections</Link>
      </div>);
    return <SectionForm key={row.id} row={row}/>;
}
