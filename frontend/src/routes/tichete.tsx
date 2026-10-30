import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, RotateCcw, X } from "lucide-react";
import { PageHeader } from "@/components/AppHeader";
import { TicketDetails } from "@/components/TicketDetails";
import { TicketFiltersPanel, VERDICT_OPTIONS } from "@/components/TicketFiltersPanel";
import { SeveritateBadge, StatusBadge } from "@/components/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTickets } from "@/hooks/useVerifix";
import { filterTickets, parseTicketFilters, ticketVerdict, type TicketFilters } from "@/lib/ticketFilters";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types";

export const Route = createFileRoute("/tichete")({
  validateSearch: parseTicketFilters,
  head: () => ({
    meta: [
      { title: "Tichete · AfterCheck" },
      { name: "description", content: "Lista prioritizată a tichetelor în AfterCheck." },
      { property: "og:title", content: "Tichete · AfterCheck" },
      { property: "og:description", content: "Lista prioritizată a tichetelor în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TicketsPage,
});

function TicketVerdictBadge({ ticket }: { ticket: Ticket }) {
  const verdict = ticketVerdict(ticket);
  const label = verdict === "trecut" ? "Fix rezolvat" : verdict === "picat" ? "Fix nerezolvat" : verdict === "manual" ? "Verificare manuală" : "Neverificat";
  return <Badge variant="outline" className={cn("w-fit whitespace-nowrap rounded-full border-transparent px-2.5 py-1 font-medium", verdict === "picat" ? "tone-danger" : "tone-neutral")}>{label}</Badge>;
}

function TicketsPage() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const ticketsQuery = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tickets = ticketsQuery.data ?? [];
  const visible = filterTickets(tickets, filters);
  const update = (patch: Partial<TicketFilters>) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const reset = () => void navigate({ search: {}, replace: true });
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.q) chips.push({ key: "q", label: `Căutare: ${filters.q}`, remove: () => update({ q: undefined }) });
  for (const [key, label] of [["status", "Status"], ["severitate", "Severitate"]] as const) {
    for (const value of filters[key] ?? []) chips.push({ key: `${key}-${value}`, label: `${label}: ${value}`, remove: () => {
      const next = filters[key]?.filter((v) => v !== value);
      update({ [key]: next?.length ? next : undefined });
    } });
  }
  if (filters.categorie) chips.push({ key: "categorie", label: `Categorie: ${filters.categorie}`, remove: () => update({ categorie: undefined }) });
  if (filters.verdict) chips.push({ key: "verdict", label: `Verdict: ${VERDICT_OPTIONS.find(([value]) => value === filters.verdict)?.[1] ?? filters.verdict}`, remove: () => update({ verdict: undefined }) });
  if (filters.testabil) chips.push({ key: "testabil", label: "Doar testabile", remove: () => update({ testabil: undefined }) });
  if (filters.redeschisDeAgent) chips.push({ key: "redeschisDeAgent", label: "Doar redeschise de agent", remove: () => update({ redeschisDeAgent: undefined }) });
  if (filters.rapid === "atentie" || filters.rapid === "confirmate") chips.push({ key: "rapid", label: filters.rapid === "atentie" ? "Necesită atenție" : "Rezolvate", remove: () => update({ rapid: undefined }) });
  const active = chips.length > 0;
  const shortcuts = [
    { label: "Toate", value: undefined, count: tickets.length },
    { label: "Necesită atenție", value: "atentie", count: filterTickets(tickets, { rapid: "atentie" }).length },
    { label: "Rezolvate", value: "confirmate", count: filterTickets(tickets, { rapid: "confirmate" }).length },
  ];
  return <TooltipProvider delayDuration={250}>
    <PageHeader title="Tichete" />
    <section aria-label="Căutare și filtrare" className="mb-6">
      <div className="flex flex-wrap items-center gap-2.5 md:flex-nowrap">
        <div className="relative min-w-0 basis-full md:flex-1 md:basis-auto"><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" /><Input type="search" aria-label="Caută tichete" placeholder="Caută după ID, titlu sau descriere" value={filters.q ?? ""} onChange={(e) => update({ q: e.target.value || undefined })} className="h-11 pl-10 pr-3" /></div>
        <TicketFiltersPanel filters={filters} categories={[...new Set(tickets.map((t) => t.categorie))].sort()} update={update} />
        {active && <Button variant="ghost" className="h-11" onClick={reset}><RotateCcw />Resetează</Button>}
      </div>
      {active && <div className="mt-3 flex flex-wrap gap-2" aria-label="Filtre active">{chips.map((chip) => <Button key={chip.key} variant="secondary" size="sm" aria-label={`Elimină ${chip.label}`} onClick={chip.remove} className="h-auto min-h-8 max-w-full justify-between rounded-full py-1.5 text-left"><span className="min-w-0 break-words whitespace-normal">{chip.label}</span><X className="size-3.5" /></Button>)}</div>}
      <div className="mt-5 flex flex-wrap gap-2">{shortcuts.map((s) => <Button key={s.label} variant="ghost" size="sm" aria-pressed={filters.rapid === s.value || (!s.value && !filters.rapid)} className={cn("rounded-full", (filters.rapid === s.value || (!s.value && !filters.rapid)) && "bg-accent text-accent-foreground")} onClick={() => update({ rapid: s.value })}>{s.label}<span className="tabular-nums opacity-70">{ticketsQuery.isPending ? "—" : s.count}</span></Button>)}</div>
    </section>
    {!ticketsQuery.isPending && !ticketsQuery.error && <p aria-live="polite" className="mb-3 text-xs tabular-nums text-muted-foreground">{active ? `${visible.length} din ${tickets.length} de tichete` : `${tickets.length} de tichete`}</p>}
    {ticketsQuery.error ? <div role="alert" className="py-8 text-sm text-destructive"><p>{ticketsQuery.error.message}</p><Button variant="outline" className="mt-3" onClick={() => void ticketsQuery.refetch()}>Încearcă din nou</Button></div> : ticketsQuery.isPending ? <div className="grid gap-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div> : !tickets.length ? <div className="py-16 text-center"><p>Încă nu ai importat tichete</p><Button asChild variant="link" className="mt-2"><Link to="/import">Importă tichete →</Link></Button></div> : !visible.length ? <div className="py-16 text-center"><p>Niciun tichet nu corespunde filtrelor</p><Button variant="outline" className="mt-4" onClick={reset}>Resetează filtrele</Button></div> : <>
      <div className="hidden md:block"><table className="w-full table-fixed text-left text-sm"><colgroup><col className="w-[8%]" /><col className="w-[12%]" /><col className="w-[28%]" /><col className="w-[13%]" /><col className="w-[20%]" /><col className="w-[19%]" /></colgroup><thead className="border-b border-border text-xs text-muted-foreground"><tr>{["Prioritate", "ID", "Titlu", "Severitate", "Status", "Ultima verificare"].map((h) => <th key={h} className="px-2 py-4 font-medium">{h}</th>)}</tr></thead><tbody>{visible.map((t) => <tr key={t.id} tabIndex={0} aria-label={`Deschide ${t.id}`} onClick={() => setSelectedId(t.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(t.id); } }} className={cn("group cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", t.redeschisDeAgent && "border-l-2 border-l-destructive")}>
        <td className="px-2 py-5 tabular-nums text-muted-foreground">{t.prioritate}</td><td className="break-words px-2 py-5 font-mono text-xs text-foreground transition-colors group-hover:text-primary">{t.id}</td><td className="px-2 py-5"><div className="line-clamp-2 break-words font-medium leading-5" title={t.titlu}>{t.titlu}</div></td><td className="px-2 py-5 [&>span]:flex-wrap"><SeveritateBadge severitate={t.severitate} sursa={t.severitateSursa} /></td><td className="px-2 py-5 [&>span]:whitespace-normal"><StatusBadge status={t.status} /></td><td className="px-2 py-5 [&>div]:whitespace-normal"><TicketVerdictBadge ticket={t} /></td>
      </tr>)}</tbody></table></div>
      <ul className="grid gap-3 md:hidden">{visible.map((t) => <li key={t.id}><Button variant="outline" aria-label={`Deschide ${t.id}`} onClick={() => setSelectedId(t.id)} className={cn("h-auto w-full flex-col items-start gap-3 rounded-xl bg-card p-4 text-left whitespace-normal", t.redeschisDeAgent && "border-l-2 border-l-destructive")}><span className="font-mono text-xs text-foreground">{t.id}</span><span className="line-clamp-2 break-words font-medium leading-5">{t.titlu}</span><span className="flex max-w-full flex-wrap gap-2"><SeveritateBadge severitate={t.severitate} sursa={t.severitateSursa} /><StatusBadge status={t.status} /></span><TicketVerdictBadge ticket={t} /></Button></li>)}</ul>
    </>}
    <TicketDetails ticket={tickets.find((t) => t.id === selectedId)} onClose={() => setSelectedId(null)} />
  </TooltipProvider>;
}
