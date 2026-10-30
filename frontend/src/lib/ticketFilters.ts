import { necesitaVerificareManuala } from "@/lib/priority";
import type { Ticket } from "@/types";

export interface TicketFilters {
  q?: string | undefined;
  status?: string[] | undefined;
  severitate?: string[] | undefined;
  categorie?: string | undefined;
  verdict?: string | undefined;
  testabil?: boolean | undefined;
  redeschisDeAgent?: boolean | undefined;
  rapid?: string | undefined;
}

const list = (v: unknown): string[] | undefined => {
  const values = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : typeof v === "string" && v ? [v] : [];
  return values.length ? values : undefined;
};
const text = (v: unknown) => typeof v === "string" && v ? v : undefined;
const flag = (v: unknown) => v === true || v === "true" || v === "1" ? true : undefined;

export function parseTicketFilters(search: Record<string, unknown>): TicketFilters {
  return {
    q: text(search['q']), status: list(search['status']), severitate: list(search['severitate']),
    categorie: text(search['categorie']), verdict: text(search['verdict']),
    testabil: flag(search['testabil']), redeschisDeAgent: flag(search['redeschisDeAgent'] ?? search['redeschise']),
    rapid: text(search['rapid']),
  };
}

export function ticketVerdict(t: Ticket): string {
  if (necesitaVerificareManuala(t)) return "manual";
  return t.ultimaVerificare?.verdict ?? "neverificat";
}

export function filterTickets(tickets: Ticket[], f: TicketFilters): Ticket[] {
  const q = (f.q ?? "").trim().toLocaleLowerCase("ro-RO");
  return tickets.filter((t) =>
    (!q || `${t.id} ${t.titlu} ${t.descriere}`.toLocaleLowerCase("ro-RO").includes(q)) &&
    (!f.status?.length || f.status.includes(t.status)) &&
    (!f.severitate?.length || (t.severitate !== null && f.severitate.includes(t.severitate))) &&
    (!f.categorie || t.categorie === f.categorie) &&
    (!f.verdict || ticketVerdict(t) === f.verdict) &&
    (!f.testabil || t.testabil) && (!f.redeschisDeAgent || t.redeschisDeAgent) &&
    (f.rapid !== "atentie" || ticketVerdict(t) === "picat" || t.redeschisDeAgent || ticketVerdict(t) === "manual") &&
    (f.rapid !== "confirmate" || ticketVerdict(t) === "trecut")
  ).sort((a, b) => a.prioritate - b.prioritate);
}

export function advancedFilterCount(f: TicketFilters): number {
  return (f.status?.length ? 1 : 0) + (f.severitate?.length ? 1 : 0) + (f.categorie ? 1 : 0);
}

export function verificationDisabledReason(t: Ticket): string | undefined {
  if (t.status !== "Rezolvat – fix livrat") return "Verificarea este disponibilă după livrarea fixului.";
  if (!t.testabil) return "Acest tichet necesită verificare manuală.";
  return undefined;
}