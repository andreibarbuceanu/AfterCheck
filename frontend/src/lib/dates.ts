import { format } from "date-fns";
import { ro } from "date-fns/locale";

// Câmpurile care conțin doar o dată vin de la backend ca „2026-08-17”.
// Ele se afișează fără oră și fără conversie de fus orar.
const DATA_SIMPLA = /^(\d{4})-(\d{2})-(\d{2})$/;
// Aceleași câmpuri, chiar dacă backend-ul li alătură din greșeală și o oră.
const DATA_LA_INCEPUT = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/;

export function eDataSimpla(iso: string): boolean {
  return DATA_SIMPLA.test(iso.trim());
}

// Nu folosește Date, deci ziua nu se mută niciodată din cauza fusului orar.
export function formatDateSimpla(iso: string): string {
  const m = DATA_LA_INCEPUT.exec(iso.trim());
  if (!m) return "—";
  const [, an, luna, zi] = m;
  return `${zi}.${luna}.${an}`;
}

export function formatDataOra(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd.MM.yyyy HH:mm", { locale: ro });
}

export function dateLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  return eDataSimpla(iso) ? formatDateSimpla(iso) : formatDataOra(iso);
}

// Pentru câmpurile care sunt mereu o dată calendaristică (dataDeschiderii, dataLivrareFix).
export function dataSimplaLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  return DATA_LA_INCEPUT.test(iso.trim()) ? formatDateSimpla(iso) : dateLabel(iso);
}
