import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { advancedFilterCount, type TicketFilters } from "@/lib/ticketFilters";
import { STATUSURI, SEVERITATE_RANG } from "@/types";

export const VERDICT_OPTIONS = [
  ["trecut", "Fix rezolvat"], ["picat", "Fix nerezolvat"], ["eroare", "Eroare"],
  ["manual", "Verificare manuală"], ["neverificat", "Neverificat"],
] as const;

type Advanced = Pick<TicketFilters, "status" | "severitate" | "categorie">;

export function TicketFiltersPanel({ filters, categories, update }: {
  filters: TicketFilters; categories: string[]; update: (patch: Partial<TicketFilters>) => void;
}) {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Advanced>({});
  const count = advancedFilterCount(filters);
  const onOpenChange = (o: boolean) => { if (o) setDraft({ status: filters.status, severitate: filters.severitate, categorie: filters.categorie }); setOpen(o); };
  const apply = (patch: Advanced) => { update({ status: patch.status, severitate: patch.severitate, categorie: patch.categorie }); setOpen(false); };
  const fields = ([
    ["status", "Status", "Toate statusurile", STATUSURI],
    ["severitate", "Severitate", "Toate severitățile", Object.keys(SEVERITATE_RANG)],
    ["categorie", "Categorie", "Toate categoriile", categories],
  ] as const).map(([key, label, all, options]) => {
    const raw = draft[key];
    const value = (Array.isArray(raw) ? raw[0] : raw) ?? "all";
    return <div key={key}><label htmlFor={`f-${key}`} className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={(v) => setDraft((d) => ({ ...d, [key]: v === "all" ? undefined : key === "categorie" ? v : [v] }))}>
        <SelectTrigger id={`f-${key}`} className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">{all}</SelectItem>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select></div>;
  });
  const body = <div className="grid gap-3">{fields}
    <div className="mt-2 flex items-center justify-between gap-2"><Button variant="ghost" size="sm" onClick={() => apply({})}>Resetează</Button><Button size="sm" onClick={() => apply(draft)}>Aplică filtrele</Button></div>
  </div>;
  const trigger = <Button variant="outline" className="h-11"><SlidersHorizontal />Filtre{count > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold tabular-nums text-primary-foreground">{count}</span>}</Button>;
  return mobile
    ? <Sheet open={open} onOpenChange={onOpenChange}><SheetTrigger asChild>{trigger}</SheetTrigger><SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl p-5"><SheetTitle className="sr-only">Filtre</SheetTitle>{body}</SheetContent></Sheet>
    : <Popover open={open} onOpenChange={onOpenChange}><PopoverTrigger asChild>{trigger}</PopoverTrigger><PopoverContent align="end" className="w-72 p-4" aria-label="Filtre">{body}</PopoverContent></Popover>;
}
