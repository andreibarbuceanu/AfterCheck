import { SEVERITATE_RANG, type Ticket } from "@/types";

/** Severity first (Critică=1 … Mică=4, missing last), then cluster report total descending. */
export function comparaPrioritate(a: Ticket, b: Ticket): number {
  const ra = a.severitate ? SEVERITATE_RANG[a.severitate] : 5;
  const rb = b.severitate ? SEVERITATE_RANG[b.severitate] : 5;
  if (ra !== rb) return ra - rb;
  return b.totalRaportariCluster - a.totalRaportariCluster;
}

export function necesitaVerificareManuala(t: Ticket): boolean {
  return t.status === "Rezolvat – fix livrat" && !t.testabil;
}

/** A developer can pick up a ticket only while nobody has started it. */
export function poatePrelua(t: Ticket): boolean {
  return t.status === "Nou";
}

export type VerificareCluster = "picat" | "trecut" | "manual" | null;

/** Cluster verdict: any failed wins, then any passed, then manual check needed, else none. */
export function verificareCluster(tichete: Ticket[]): VerificareCluster {
  if (tichete.some((t) => t.ultimaVerificare?.verdict === "picat")) return "picat";
  if (tichete.some((t) => t.ultimaVerificare?.verdict === "trecut")) return "trecut";
  if (tichete.some(necesitaVerificareManuala)) return "manual";
  return null;
}

/** Clusters by max severity (Critică first), then report total descending. */
export function comparaClustere(a: { severitateMax: keyof typeof SEVERITATE_RANG; totalRaportari: number }, b: typeof a): number {
  const d = SEVERITATE_RANG[a.severitateMax] - SEVERITATE_RANG[b.severitateMax];
  return d !== 0 ? d : b.totalRaportari - a.totalRaportari;
}

/** Share of auto-tested fixes that were confirmed (0–100). */
export function procentConfirmate(confirmate: number, invalidate: number): number {
  const n = confirmate + invalidate;
  return n === 0 ? 0 : Math.round((confirmate / n) * 100);
}
