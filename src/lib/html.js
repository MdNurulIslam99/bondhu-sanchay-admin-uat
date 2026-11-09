// Description text is stored as HTML, so only a small safe set of tags and styles is ever kept.
const ALLOWED_TAGS = new Set(["P", "BR", "B", "STRONG", "I", "EM", "U", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE", "A", "SPAN", "DIV"]);
const DROPPED_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE", "NOSCRIPT", "LINK", "META"]);
const SAFE_ALIGN = /^(left|center|right|justify)$/;
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function clean(node) {
    for (const child of [...node.childNodes]) {
        if (child.nodeType === Node.TEXT_NODE)
            continue;
        if (child.nodeType !== Node.ELEMENT_NODE || DROPPED_WITH_CONTENT.has(child.tagName)) {
            child.remove();
            continue;
        }
        clean(child);
        if (!ALLOWED_TAGS.has(child.tagName)) {
            child.replaceWith(...child.childNodes);
            continue;
        }
        const href = child.getAttribute("href");
        const align = child.style.textAlign;
        const color = child.style.color;
        for (const attr of [...child.attributes])
            child.removeAttribute(attr.name);
        if (child.tagName === "A" && href && SAFE_HREF.test(href.trim())) {
            child.setAttribute("href", href.trim());
            child.setAttribute("rel", "noopener noreferrer");
        }
        if (SAFE_ALIGN.test(align))
            child.style.textAlign = align;
        if (SAFE_COLOR.test(color))
            child.style.color = color;
    }
}

const parse = (html) => new DOMParser().parseFromString(html ?? "", "text/html").body;

export function sanitizeHtml(html) {
    const body = parse(html);
    clean(body);
    return body.innerHTML;
}

export const stripHtml = (html) => {
    const body = parse(String(html ?? "").replace(/<\/(p|div|h[2-4]|li|blockquote)>/gi, "$& "));
    return body.textContent.replace(/\s+/g, " ").trim();
};
