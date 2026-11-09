// Page Section helpers, and the file the public website can read its content from.
import { sanitizeHtml } from "./html";

export const SECTION_HEADERS = Array.from({ length: 20 }, (_, i) => `Section ${i + 1}`);
export const STATUS_OPTIONS = [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }];

const headerNumber = (s) => Number(String(s.sectionHeader).replace(/\D/g, "")) || 0;

// Page order first, then Section 1, 2, 3..., then position inside a section.
export const sectionOrder = (pageNames) => {
    const rank = Object.fromEntries(pageNames.map((p, i) => [p.id, i]));
    return (a, b) => (rank[a.pageId] ?? 999) - (rank[b.pageId] ?? 999) || headerNumber(a) - headerNumber(b) || a.position - b.position;
};

export const nextPosition = (sections, pageId, sectionHeader, ignoreId) => {
    const used = sections.filter((s) => s.pageId === pageId && s.sectionHeader === sectionHeader && s.id !== ignoreId).map((s) => s.position);
    return Math.max(0, ...used) + 1;
};

// Active pages and active sections only.
export function buildSiteContent(pageNames, sections, faqs, projects) {
    return {
        exportedAt: new Date().toISOString(),
        pages: pageNames.filter((p) => p.status === "active").map((p) => ({
            name: p.name,
            sections: sections.filter((s) => s.pageId === p.id && s.status === "active").sort(sectionOrder(pageNames)).map((s) => ({
                sectionHeader: s.sectionHeader,
                position: s.position,
                title: s.title,
                subTitle: s.subTitle ?? "",
                description: sanitizeHtml(s.description),
                images: s.images ?? [],
            })),
        })),
        faqs: faqs.map(({ question, answer }) => ({ question, answer })),
        // Public details only: no investor, contact or money figures.
        projects: projects.filter((p) => p.showOnWebsite === "yes").map((p) => ({
            name: p.name,
            businessType: p.businessType,
            status: p.status,
            startDate: p.startDate,
            location: p.location ?? "",
            summary: p.summary ?? "",
            description: sanitizeHtml(p.description),
            images: p.images ?? [],
        })),
    };
}

export function downloadSiteContent(pageNames, sections, faqs, projects) {
    const text = JSON.stringify(buildSiteContent(pageNames, sections, faqs, projects), null, 2);
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-content.json";
    a.click();
    URL.revokeObjectURL(url);
}
