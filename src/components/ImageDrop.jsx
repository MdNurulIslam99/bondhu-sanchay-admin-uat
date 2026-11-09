"use client";
import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

const MAX_IMAGES = 5, MAX_FILE_MB = 5, MAX_SIDE = 1000;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Images are kept in browser storage for now, so each one is shrunk first to save space.
function shrink(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
        img.src = url;
    });
}

// Thumbnail with a camera placeholder when there is no image or it fails to load.
export function Thumb({ src, alt = "" }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed)
        return <span className="grid h-10 w-14 place-items-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800" title="No image"><Camera size={18} aria-label="No image"/></span>;
    return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-10 w-14 rounded-md object-cover"/>;
}

export default function ImageDrop({ images, onChange, label }) {
    const input = useRef(null);
    const [over, setOver] = useState(false);
    const [error, setError] = useState("");

    const addFiles = async (files) => {
        setError("");
        const room = MAX_IMAGES - images.length;
        const picked = [...files];
        const bad = picked.find((f) => !TYPES.includes(f.type) || f.size > MAX_FILE_MB * 1024 * 1024);
        if (bad)
            return setError(`${bad.name}: use a JPG, PNG or WEBP image under ${MAX_FILE_MB} MB.`);
        if (picked.length > room)
            return setError(`You can add up to ${MAX_IMAGES} images per section.`);
        try {
            onChange([...images, ...await Promise.all(picked.map(shrink))]);
        }
        catch {
            setError("One of the images could not be read.");
        }
    };

    return (<div>
      <button type="button" aria-label={`${label}: click to choose files`} onClick={() => input.current.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }} className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-6 text-sm transition ${over ? "border-brand bg-brand/5" : "border-slate-300 bg-slate-50 hover:border-brand dark:border-slate-700 dark:bg-slate-800/40"}`}>
        <ImagePlus size={24} className="text-brand dark:text-gold"/>
        <span className="font-medium">Drop images here, or click to choose</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG or WEBP, up to {MAX_FILE_MB} MB each, {MAX_IMAGES} images at most</span>
      </button>
      <input ref={input} type="file" multiple accept={TYPES.join(",")} className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}/>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
      {images.length > 0 && (<ul className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (<li key={i} className="relative">
              <img src={src} alt={`Section image ${i + 1}`} className="h-20 w-28 rounded-lg object-cover"/>
              <button type="button" aria-label={`Remove image ${i + 1}`} onClick={() => onChange(images.filter((_, n) => n !== i))} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-red-600 text-white"><X size={12}/></button>
            </li>))}
        </ul>)}
    </div>);
}
