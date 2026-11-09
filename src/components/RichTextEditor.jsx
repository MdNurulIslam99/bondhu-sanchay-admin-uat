"use client";
import { useEffect, useRef, useState } from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, Italic, Link2, List, ListOrdered, Quote, Underline } from "lucide-react";
import { sanitizeHtml } from "@/lib/html";

const FORMAT_BUTTONS = [
    [Bold, "Bold", "bold"], [Italic, "Italic", "italic"], [Underline, "Underline", "underline"],
];
const ALIGN_BUTTONS = [
    [AlignLeft, "Align left", "justifyLeft"], [AlignCenter, "Align center", "justifyCenter"], [AlignRight, "Align right", "justifyRight"], [AlignJustify, "Justify", "justifyFull"],
];
const LIST_BUTTONS = [
    [List, "Bullet list", "insertUnorderedList"], [ListOrdered, "Numbered list", "insertOrderedList"],
];

export default function RichTextEditor({ label, value, onChange, id }) {
    const editor = useRef(null);
    const [source, setSource] = useState(false);

    // Loads the value when the editor opens or returns from source view. Typing never re-renders into it.
    useEffect(() => {
        if (!source && editor.current)
            editor.current.innerHTML = sanitizeHtml(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source]);

    const run = (command, arg) => {
        editor.current.focus();
        document.execCommand("styleWithCSS", false, true);
        document.execCommand(command, false, arg);
        onChange(editor.current.innerHTML);
    };
    const addLink = () => {
        const url = window.prompt("Link address (https://...)");
        if (url)
            run("createLink", url);
    };
    const toolButton = ([Icon, title, command]) => (<button key={command} type="button" title={title} aria-label={title} onMouseDown={(e) => { e.preventDefault(); run(command); }} disabled={source} className="rte-btn"><Icon size={15}/></button>);

    return (<div className="overflow-hidden rounded-lg border border-slate-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800/60">
        <select aria-label="Text style" disabled={source} defaultValue="" className="rounded border border-slate-300 bg-white px-1.5 py-1 text-xs dark:border-slate-600 dark:bg-slate-900" onChange={(e) => { run("formatBlock", e.target.value); e.target.value = ""; }}>
          <option value="" disabled>Text style</option>
          <option value="P">Paragraph</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="H4">Heading 4</option>
        </select>
        {FORMAT_BUTTONS.map(toolButton)}
        <button type="button" title="Quote" aria-label="Quote" disabled={source} onMouseDown={(e) => { e.preventDefault(); run("formatBlock", "BLOCKQUOTE"); }} className="rte-btn"><Quote size={15}/></button>
        <label title="Text color" className="rte-btn relative cursor-pointer overflow-hidden">
          <span aria-hidden="true" className="text-sm font-semibold underline decoration-2">A</span>
          <input type="color" aria-label="Text color" disabled={source} className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => run("foreColor", e.target.value)}/>
        </label>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600"/>
        {ALIGN_BUTTONS.map(toolButton)}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600"/>
        {LIST_BUTTONS.map(toolButton)}
        <button type="button" title="Add link" aria-label="Add link" disabled={source} onMouseDown={(e) => { e.preventDefault(); addLink(); }} className="rte-btn"><Link2 size={15}/></button>
        <button type="button" title="HTML source" aria-label="HTML source" aria-pressed={source} onClick={() => setSource(!source)} className={`rte-btn ml-auto ${source ? "bg-brand text-white hover:bg-brand" : ""}`}><Code size={15}/></button>
      </div>
      {source
            ? <textarea id={id} aria-label={`${label} HTML source`} value={value} onChange={(e) => onChange(e.target.value)} className="block min-h-56 w-full bg-white p-3 font-mono text-xs outline-none dark:bg-slate-900"/>
            : <div id={id} ref={editor} role="textbox" aria-multiline="true" aria-label={label} contentEditable suppressContentEditableWarning onInput={(e) => onChange(e.currentTarget.innerHTML)} className="rte min-h-56 bg-white p-3 text-sm outline-none dark:bg-slate-900"/>}
    </div>);
}
