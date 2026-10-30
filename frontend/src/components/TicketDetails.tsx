import { Link } from "@tanstack/react-router";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { SeveritateBadge, StatusBadge, VerdictBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRunVerification, useSchedulerStatus } from "@/hooks/useVerifix";
import { ticketVerdict, verificationDisabledReason } from "@/lib/ticketFilters";
import type { Ticket } from "@/types";

function relativeTime(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : formatDistanceToNow(date, { addSuffix: true, locale: ro });
}

// „pasiVerificare" vine de la backend ca text: „1. …\n2. …\nRezultat așteptat: …".
function parsePasi(text: string): { pasi: string[]; asteptat: string | null } {
  const pasi: string[] = [];
  let asteptat: string | null = null;
  for (const linie of text.split("\n")) {
    const t = linie.trim();
    if (!t) continue;
    const asteptatMatch = /^Rezultat așteptat\s*:\s*(.+)$/i.exec(t);
    const numerotat = /^\d+[.)]\s*(.+)$/.exec(t);
    if (asteptatMatch) asteptat = asteptatMatch[1] ?? null;
    else if (numerotat) pasi.push(numerotat[1] ?? t);
    else pasi.push(t);
  }
  return { pasi, asteptat };
}

export function TicketDetails({ ticket, onClose }: { ticket: Ticket | undefined; onClose: () => void }) {
  const run = useRunVerification();
  const scheduler = useSchedulerStatus();
  const busy = run.isPending || !!scheduler.data?.ruleazaAcum;
  const reason = ticket ? verificationDisabledReason(ticket) ?? (busy ? "O verificare este deja în curs." : undefined) : undefined;
  const verdict = ticket ? ticketVerdict(ticket) : "neverificat";
  const pasiText = ticket?.pasiVerificare ?? null;
  const { pasi, asteptat } = pasiText ? parsePasi(pasiText) : { pasi: [] as string[], asteptat: null as string | null };
  return <Sheet open={!!ticket} onOpenChange={(open) => { if (!open) onClose(); }}>
    <SheetContent className="w-full overflow-y-auto sm:w-[480px] sm:max-w-[480px]">
      {ticket && <>
        <SheetHeader className="pr-6 text-left">
          <SheetDescription className="font-mono text-primary">{ticket.id}</SheetDescription>
          <SheetTitle className="break-words text-xl">{ticket.titlu}</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge status={ticket.status} />
          <SeveritateBadge severitate={ticket.severitate} sursa={ticket.severitateSursa} />
          {verdict !== "neverificat" && <VerdictBadge verdict={verdict === "manual" ? "manual" : ticket.ultimaVerificare?.verdict ?? "manual"} />}
        </div>
        <p className="mt-3 text-sm text-muted-foreground"><span className="tabular-nums">{ticket.nrRaportari}</span> raportări{ticket.redeschisDeAgent && " · Redeschis de agent"}</p>
        <section className="mt-5"><h3 className="font-semibold">Descriere</h3><p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{ticket.descriere}</p></section>
        <section className="mt-5"><h3 className="font-semibold">Pași de verificare</h3>
          {ticket.pasiVerificare ? <>
            <ol className="mt-2 grid gap-1.5 text-sm leading-6 text-muted-foreground">{pasi.map((pas, i) => <li key={i} className="flex gap-2"><span className="shrink-0 tabular-nums text-foreground">{i + 1}.</span><span className="min-w-0 break-words">{pas}</span></li>)}</ol>
            {asteptat && <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm"><span className="font-medium">Rezultat așteptat:</span> <span className="text-muted-foreground">{asteptat}</span></p>}
          </> : <p className="mt-1.5 text-sm text-muted-foreground">Fără pași: necesită verificare manuală</p>}
        </section>
        <section className="mt-5 border-t border-border pt-4"><h3 className="font-semibold">Ultima verificare</h3>
          {ticket.ultimaVerificare ? <div className="mt-2 flex flex-wrap items-center gap-2">
            <VerdictBadge verdict={ticket.ultimaVerificare.verdict} />
            <time dateTime={ticket.ultimaVerificare.data} title={ticket.ultimaVerificare.data} className="text-xs text-muted-foreground">{relativeTime(ticket.ultimaVerificare.data)}</time>
            <Button asChild variant="link" className="h-auto px-0 py-1"><Link to="/rapoarte/$id" params={{ id: ticket.ultimaVerificare.raportId }}>Deschide raportul →</Link></Button>
          </div> : <p className="mt-1.5 text-sm text-muted-foreground">Acest tichet nu a fost verificat încă.</p>}
        </section>
        <div className="mt-5 border-t border-border pt-4"><Tooltip><TooltipTrigger asChild><span tabIndex={reason ? 0 : undefined} className="block"><Button variant="premium" className="h-auto min-h-10 w-full whitespace-normal" disabled={!!reason} onClick={() => run.mutate([ticket.id], { onError: (e) => toast.error(e.message) })}>{busy ? <Loader2 className="animate-spin" /> : <PlayCircle />}{busy ? "Se verifică…" : "Verifică acum"}</Button></span></TooltipTrigger>{reason && <TooltipContent>{reason}</TooltipContent>}</Tooltip></div>
      </>}
    </SheetContent>
  </Sheet>;
}
