import { useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Terminal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PasRaport, Raport } from "@/types";

const REZ = {
  ok: ["tone-neutral", "OK"],
  picat: ["tone-danger", "PICAT"],
  neexecutat: ["tone-neutral", "NEEXECUTAT"],
} as const;

export function PasBadge({ rezultat }: { rezultat: PasRaport["rezultat"] }) {
  const [cls, label] = REZ[rezultat] ?? REZ.neexecutat;
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cls)}>{label}</span>;
}

function Lightbox({ urls, index, onClose, onIndex }: { urls: string[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % urls.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + urls.length) % urls.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [index, urls.length, onClose, onIndex]);
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6 backdrop-blur" onClick={onClose}>
      <img src={urls[index]} alt={`Captură ${index + 1}`} className="max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      <button type="button" aria-label="Închide" onClick={onClose} className="absolute right-5 top-5 rounded-full bg-card p-2"><X className="h-5 w-5" /></button>
      {urls.length > 1 && (
        <>
          <button type="button" aria-label="Anterior" onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + urls.length) % urls.length); }} className="absolute left-5 rounded-full bg-card p-2"><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" aria-label="Următor" onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % urls.length); }} className="absolute right-5 rounded-full bg-card p-2"><ChevronRight className="h-6 w-6" /></button>
          <span className="absolute bottom-5 rounded-full bg-card px-3 py-1 text-xs tabular-nums">{index + 1} / {urls.length}</span>
        </>
      )}
    </div>
  );
}

export function PasiRaport({ pasi }: { pasi: PasRaport[] }) {
  const urls = pasi.flatMap((p) => (p.screenshotUrl ? [p.screenshotUrl] : []));
  const [idx, setIdx] = useState<number | null>(null);
  const open = (u: string) => setIdx(urls.indexOf(u));
  return (
    <>
      <ol className="grid gap-2">
        {pasi.map((p) => {
          const picat = p.rezultat === "picat";
          return (
            <li key={p.nr} className={cn("flex flex-wrap items-start gap-3 rounded-xl bg-muted/40 px-3 py-2.5 text-xs", p.rezultat === "neexecutat" && "opacity-50")}>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <PasBadge rezultat={p.rezultat} />
                <span className="font-medium">{p.nr}. {p.actiune}</span>
                {p.selector && <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{p.selector}</code>}
                {p.durataMs != null && <span className="tabular-nums text-muted-foreground">{p.durataMs} ms</span>}
                {picat && p.screenshotUrl && (
                  <button type="button" onClick={() => open(p.screenshotUrl!)} className="mt-2 w-full">
                    <img src={p.screenshotUrl} alt={`Pasul ${p.nr}`} className="block w-full rounded-xl object-contain" />
                  </button>
                )}
                {p.detalii && (
                  <span className={cn("w-full", picat ? "mt-1 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-destructive" : "text-muted-foreground")}>{p.detalii}</span>
                )}
              </div>
              {!picat && p.screenshotUrl && (
                <button type="button" onClick={() => open(p.screenshotUrl!)} className="shrink-0">
                  <img src={p.screenshotUrl} alt={`Pasul ${p.nr}`} className="h-[100px] w-[160px] rounded-lg object-cover" />
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {idx !== null && idx >= 0 && <Lightbox urls={urls} index={idx} onClose={() => setIdx(null)} onIndex={setIdx} />}
    </>
  );
}

export function EroriTehnice({ raport }: { raport: Raport }) {
  return (
    <>
      {!!raport.eroriDom?.length && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-destructive"><AlertTriangle className="h-3.5 w-3.5" /> Erori DOM</p>
          <ul className="grid gap-1 font-mono text-[11px] leading-5 text-destructive">
            {raport.eroriDom.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
      {raport.stackTrace && (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-muted/60 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold"><Terminal className="h-3.5 w-3.5" /> Stack trace</p>
          <pre className="whitespace-pre font-mono text-[11px] leading-5">{raport.stackTrace}</pre>
        </div>
      )}
    </>
  );
}
