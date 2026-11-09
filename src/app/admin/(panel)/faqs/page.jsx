"use client";
import Resource from "@/components/Resource";
export default function Page() {
    return (<Resource collection="faqs" title="FAQ Content" singular="Question" columns={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer", render: (r) => <span className="line-clamp-1 max-w-sm">{r.answer}</span> }]} fields={[
            { name: "question", label: "Question", required: true, full: true },
            { name: "answer", label: "Answer", type: "textarea", required: true },
        ]}/>);
}
