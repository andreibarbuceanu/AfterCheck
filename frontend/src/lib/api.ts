import type { Cluster, ImportResult, PostReleaseFeedbackImportResult, PostReleaseImpact, Raport, SchedulerStatus, Stats, Status, Ticket } from "@/types";
import { STATUSURI } from "@/types";
import { buildClusters, createMockState, rerank } from "./mockData";
import { necesitaVerificareManuala, poatePrelua } from "./priority";

export interface AfterCheckApi {
  getPostReleaseImpacts(): Promise<PostReleaseImpact[]>;
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket>;
  getClusters(): Promise<Cluster[]>;
  getStats(): Promise<Stats>;
  getReports(ticketId?: string): Promise<Raport[]>;
  getReport(id: string): Promise<Raport>;
  importExcel(file: File): Promise<ImportResult>;
  importPostReleaseFeedback(file: File): Promise<PostReleaseFeedbackImportResult>;
  runVerification(ticketIds?: string[]): Promise<SchedulerStatus>;
  getSchedulerStatus(): Promise<SchedulerStatus>;
  clearDemoData(): Promise<{ ticheteSterse: number; rapoarteSterse: number }>;
}

export function computeStats(tickets: Ticket[], impacts: PostReleaseImpact[] = []): Stats {
  const perStatus = Object.fromEntries(STATUSURI.map((s) => [s, 0])) as Record<Status, number>;
  const cat = new Map<string, { raportari: number; tichete: number }>();
  for (const t of tickets) {
    perStatus[t.status]++;
    const c = cat.get(t.categorie) ?? { raportari: 0, tichete: 0 };
    c.raportari += t.nrRaportari;
    c.tichete++;
    cat.set(t.categorie, c);
  }
  const verificate = tickets.filter((t) => t.ultimaVerificare);
  const invalidate = tickets.filter((t) => t.redeschisDeAgent).length;
  const hasPostRelease = impacts.length > 0;
  const confirmedPostRelease = impacts.filter((impact) => impact.concluzie === "fix_confirmat").length;
  const invalidatedPostRelease = impacts.filter((impact) => impact.concluzie === "fix_invalidat").length;
  const monitoringPostRelease = impacts.filter((impact) => impact.concluzie === "necesita_monitorizare").length;
  return {
    totalTichete: hasPostRelease ? impacts.length : tickets.length,
    ticheteDisponibile: tickets.filter(poatePrelua).length,
    perStatus,
    fixuriConfirmate: hasPostRelease ? confirmedPostRelease : tickets.filter((t) => t.status === "Rezolvat – fix livrat" && t.ultimaVerificare?.verdict === "trecut").length,
    fixuriInvalidate: hasPostRelease ? invalidatedPostRelease : invalidate,
    necesitaMonitorizare: monitoringPostRelease,
    necesitaVerificareManuala: tickets.filter(necesitaVerificareManuala).length,
    rataRedeschidere: hasPostRelease ? invalidatedPostRelease / impacts.length : verificate.length ? invalidate / verificate.length : 0,
    raportariPeCategorie: [...cat.entries()].map(([categorie, v]) => ({ categorie, ...v })).sort((a, b) => b.raportari - a.raportari),
  };
}

const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), 300));

export function createMockApi(): AfterCheckApi {
  const st = createMockState();
  const status = (): SchedulerStatus => ({
    ruleazaAcum: st.ruleazaAcum,
    ultimaRulare: st.ultimaRulare,
    urmatoareaRulare: st.ultimaRulare
      ? new Date(new Date(st.ultimaRulare).getTime() + st.settings.intervalMinute * 60000).toISOString()
      : null,
  });
  const find = (id: string) => {
    const t = st.tickets.find((x) => x.id === id);
    if (!t) throw new Error(`Tichetul ${id} nu există`);
    return t;
  };
  return {
    getPostReleaseImpacts: () => delay(st.impacts),
    getTickets: () => delay(st.tickets),
    getTicket: async (id) => delay(find(id)),
    getClusters: () => delay(buildClusters(st.tickets)),
    getStats: () => delay(computeStats(st.tickets, st.impacts)),
    getReports: (ticketId) =>
      delay(st.reports.filter((r) => !ticketId || r.ticketId === ticketId).sort((a, b) => b.data.localeCompare(a.data))),
    getReport: async (id) => {
      const r = st.reports.find((x) => x.id === id);
      if (!r) throw new Error(`Raportul ${id} nu există`);
      return delay(r);
    },
    importExcel: async () => {
      st.tickets = rerank(st.tickets);
      return delay({ importate: st.tickets.length, severitatiCompletateDeAI: st.tickets.filter((t) => t.severitateSursa === "llm").length, clustere: buildClusters(st.tickets).length });
    },
    importPostReleaseFeedback: async () => {
      throw new Error("Importul tichetelor post-release necesită conexiunea la server.");
    },
    runVerification: async (ticketIds) => {
      st.ruleazaAcum = true;
      const now = new Date().toISOString();
      setTimeout(() => {
        for (const t of st.tickets) {
          if (t.status !== "Rezolvat – fix livrat" || !t.testabil) continue;
          if (ticketIds?.length && !ticketIds.includes(t.id)) continue;
          if (t.ultimaVerificare) t.ultimaVerificare = { ...t.ultimaVerificare, data: now, versiuneTestata: st.settings.versiuneLive };
        }
        st.ultimaRulare = now;
        st.ruleazaAcum = false;
      }, 4000);
      return delay(status());
    },
    getSchedulerStatus: () => delay(status()),
    clearDemoData: async () => {
      const rezultat = { ticheteSterse: st.tickets.length, rapoarteSterse: st.reports.length };
      st.tickets = [];
      st.reports = [];
      st.impacts = [];
      return delay(rezultat);
    },
  };
}

export function createHttpApi(base: string): AfterCheckApi {
  const req = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(base + path, init);
    if (!res.ok) throw new Error(`Eroare API ${res.status}: ${await res.text().catch(() => "")}`);
    return res.json() as Promise<T>;
  };
  const json = (method: string, body: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return {
    getPostReleaseImpacts: () => req("/api/post-release-impact"),
    getTickets: () => req("/api/tickets"),
    getTicket: (id) => req(`/api/tickets/${encodeURIComponent(id)}`),
    getClusters: () => req("/api/clusters"),
    getStats: () => req("/api/stats"),
    getReports: (ticketId) => req(`/api/reports${ticketId ? `?ticketId=${encodeURIComponent(ticketId)}` : ""}`),
    getReport: (id) => req(`/api/reports/${encodeURIComponent(id)}`),
    importExcel: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return req("/api/import", { method: "POST", body: fd });
    },
    importPostReleaseFeedback: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return req("/api/post-release-tickets/import", { method: "POST", body: fd });
    },
    runVerification: (ticketIds) => req("/api/verify/run", json("POST", { ticketIds })),
    getSchedulerStatus: () => req("/api/verify/status"),
    clearDemoData: () => req("/api/demo-data", { method: "DELETE" }),
  };
}

const useMock = (import.meta.env["VITE_USE_MOCK"] ?? "true") !== "false";
export const api: AfterCheckApi = useMock
  ? createMockApi()
  : createHttpApi(import.meta.env["VITE_API_URL"] ?? "http://localhost:8000");
