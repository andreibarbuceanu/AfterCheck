import type { Cluster, PostReleaseImpact, Raport, Severitate, Status, Ticket } from "@/types";
import { SEVERITATE_RANG } from "@/types";
import { comparaPrioritate } from "./priority";

const RULARE = "2026-10-24T13:05:00Z";
const AZI = "2026-10-24";

type Seed = Partial<Ticket> &
  Pick<Ticket, "id" | "titlu" | "categorie" | "status" | "severitate" | "nrRaportari" | "clusterId">;

const pasi = (lista: string[], asteptat: string) =>
  lista.map((p, i) => `${i + 1}. ${p}`).join("\n") + `\nRezultat așteptat: ${asteptat}`;

const seeds: Seed[] = [
  {
    id: "WB-1027", titlu: "Check-in-ul online eșuează pentru grupuri de peste 4 pasageri", categorie: "Check-in",
    functionalitate: "Check-in online", severitate: "Critică", nrRaportari: 115, clusterId: "C-01",
    status: "În lucru", dataDeschiderii: AZI, versiuneFix: "3.13.2", dataLivrareFix: "2026-10-18", redeschisDeAgent: true,
    descriere: "La rezervările cu 5+ pasageri, pasul de confirmare a check-in-ului afișează o eroare generică.",
    pasiVerificare: pasi(["Autentifică-te cu contul de test", "Deschide rezervarea WBT5PAX (5 pasageri)", "Apasă „Fă check-in pentru toți”"], "Se generează 5 boarding pass-uri."),
    ultimaVerificare: { verdict: "picat", data: RULARE, versiuneTestata: "3.14.0", raportId: "R-1027-1" },
  },
  { id: "WB-1040", titlu: "Nu pot face check-in pentru toată familia (6 persoane)", categorie: "Check-in", functionalitate: "Check-in online", severitate: "Critică", nrRaportari: 360, clusterId: "C-01", status: "Nou", tichetLegat: "WB-1027" },
  {
    id: "WB-1022", titlu: "Codul QR de pe boarding pass nu e citit la poartă", categorie: "Check-in", functionalitate: "Boarding pass",
    severitate: "Mare", nrRaportari: 43, clusterId: "C-02", status: "În lucru", dataDeschiderii: AZI, versiuneFix: "3.13.1", dataLivrareFix: "2026-10-12", redeschisDeAgent: true,
    descriere: "Scannerele de la poartă nu recunosc codul QR afișat în aplicație.",
    pasiVerificare: pasi(["Deschide boarding pass-ul pentru zborul W6 3101", "Mărește codul QR"], "Codul QR are contrast ridicat (negru pe alb) și e lizibil."),
    ultimaVerificare: { verdict: "picat", data: RULARE, versiuneTestata: "3.14.0", raportId: "R-1022-1" },
  },
  {
    id: "WB-1036", titlu: "Codul QR de pe boarding pass nu e citit la poartă (Android)", categorie: "Check-in", functionalitate: "Boarding pass",
    severitate: "Mare", nrRaportari: 188, clusterId: "C-02", status: "În lucru", dataDeschiderii: AZI, versiuneFix: "3.13.1", dataLivrareFix: "2026-10-12", redeschisDeAgent: true, tichetLegat: "WB-1022",
    descriere: "Pe Android, codul QR apare decolorat și nu e scanat la poartă.",
    pasiVerificare: pasi(["Deschide boarding pass-ul pentru zborul W6 2207", "Verifică afișarea codului QR"], "Codul QR este negru pe alb și se scanează."),
    ultimaVerificare: { verdict: "picat", data: RULARE, versiuneTestata: "3.14.0", raportId: "R-1036-1" },
  },
  { id: "WB-1042", titlu: "Agentul de la poartă nu poate scana boarding pass-ul din aplicație", categorie: "Check-in", functionalitate: "Boarding pass", severitate: "Mare", nrRaportari: 43, clusterId: "C-02", status: "Nou" },
  {
    id: "WB-1016", titlu: "Harta de locuri nu se încarcă pentru zborurile cu A321neo", categorie: "Rezervare", functionalitate: "Selectare loc",
    severitate: "Mare", nrRaportari: 81, clusterId: "C-03", status: "Rezolvat – fix livrat", versiuneFix: "3.14.0", dataLivrareFix: "2026-10-22",
    pasiVerificare: pasi(["Caută zborul W6 4410 (A321neo)", "Selectează tariful Basic", "Deschide pasul „Alege locul”"], "Harta cu 239 de locuri se afișează."),
    ultimaVerificare: { verdict: "trecut", data: RULARE, versiuneTestata: "3.14.0", raportId: "R-1016-1" },
  },
  {
    id: "WB-1029", titlu: "Selectarea locului rămâne blocată în loading (A321neo)", categorie: "Rezervare", functionalitate: "Selectare loc",
    severitate: "Mare", nrRaportari: 35, clusterId: "C-03", status: "Rezolvat – fix livrat", versiuneFix: "3.14.0", dataLivrareFix: "2026-10-22", tichetLegat: "WB-1016",
    pasiVerificare: pasi(["Deschide rezervarea WBA321", "Apasă „Schimbă locul”"], "Harta se încarcă în sub 3 secunde."),
    ultimaVerificare: { verdict: "trecut", data: RULARE, versiuneTestata: "3.14.0", raportId: "R-1029-1" },
  },
  { id: "WB-1013", titlu: "Harta de locuri goală pe un singur zbor", categorie: "Rezervare", functionalitate: "Selectare loc", severitate: "Medie", nrRaportari: 4, clusterId: "C-03", status: "Închis – nu se reproduce" },
  {
    id: "WB-1008", titlu: "Prețul bagajului de cală crește la plată", categorie: "Bagaje", functionalitate: "Adăugare bagaj",
    severitate: "Medie", nrRaportari: 30, clusterId: "C-04", status: "Rezolvat – fix livrat", versiuneFix: "3.13.0", dataLivrareFix: "2026-10-05",
    pasiVerificare: pasi(["Adaugă un bagaj de cală de 20 kg la rezervarea WB20KG", "Notează prețul afișat", "Continuă până la pagina de plată"], "Prețul la plată este identic cu cel ales."),
    ultimaVerificare: { verdict: "trecut", data: RULARE, versiuneTestata: "3.14.0", raportId: "R-1008-1" },
  },
  { id: "WB-1021", titlu: "Rambursarea pentru zborul anulat nu ajunge în cont", categorie: "Rambursări", functionalitate: "Cerere rambursare", severitate: "Critică", nrRaportari: 330, clusterId: "C-05", status: "Rezolvat – fix livrat", versiuneFix: "3.13.2", dataLivrareFix: "2026-10-18" },
  { id: "WB-1034", titlu: "Butonul «Retrimite codul» nu funcționează", categorie: "Cont", functionalitate: "Autentificare 2FA", severitate: "Mare", nrRaportari: 340, clusterId: "C-06", status: "Rezolvat – fix livrat", versiuneFix: "3.14.0", dataLivrareFix: "2026-10-22" },
  { id: "WB-1026", titlu: "Chat-ul cu suportul se închide după primul mesaj", categorie: "Suport", functionalitate: "Chat live", severitate: "Mare", nrRaportari: 388, clusterId: "C-07", status: "Rezolvat – fix livrat", versiuneFix: "3.13.1", dataLivrareFix: "2026-10-12", canal: "Rețele sociale" },
  { id: "WB-1045", titlu: "Plata cu Apple Pay e respinsă fără mesaj", categorie: "Plăți", functionalitate: "Apple Pay", severitate: "Mare", severitateSursa: "llm", nrRaportari: 57, clusterId: "C-08", status: "Nou", canal: "Email" },
  { id: "WB-1046", titlu: "Notificarea de schimbare a porții vine după îmbarcare", categorie: "Notificări", functionalitate: "Push", severitate: "Medie", severitateSursa: "llm", nrRaportari: 22, clusterId: "C-09", status: "Nou", canal: "Call center" },
  { id: "WB-1031", titlu: "Abonamentul Wizz Bees Club nu se reînnoiește automat", categorie: "Abonamente", functionalitate: "Reînnoire", severitate: "Medie", nrRaportari: 64, clusterId: "C-10", status: "În lucru" },
  { id: "WB-1018", titlu: "Aplicația se închide la deschiderea istoricului de zboruri", categorie: "Aplicație", functionalitate: "Istoric", severitate: "Mare", nrRaportari: 96, clusterId: "C-11", status: "În lucru" },
  { id: "WB-1011", titlu: "Cererea de asistență specială nu se salvează", categorie: "Asistență specială", functionalitate: "Formular PRM", severitate: "Critică", nrRaportari: 18, clusterId: "C-12", status: "În lucru" },
  { id: "WB-1005", titlu: "Fontul e prea mic în ecranul de confirmare", categorie: "Aplicație", functionalitate: "Confirmare", severitate: "Mică", nrRaportari: 7, clusterId: "C-13", status: "Închis – nu se reproduce" },
  { id: "WB-1038", titlu: "Factura PDF nu include CUI-ul firmei", categorie: "Plăți", functionalitate: "Facturare", severitate: "Mică", nrRaportari: 12, clusterId: "C-14", status: "Nou" },
  { id: "WB-1033", titlu: "Emailul de confirmare a rezervării ajunge în spam", categorie: "Notificări", functionalitate: "Email", severitate: "Medie", nrRaportari: 41, clusterId: "C-15", status: "Nou" },
];

const ECHIPE: Record<string, string> = {
  "Check-in": "Echipa Aeroport", Rezervare: "Echipa Booking", Bagaje: "Echipa Booking", Plăți: "Echipa Payments",
  Rambursări: "Echipa Payments", Cont: "Echipa Identity", Notificări: "Echipa Comms", Abonamente: "Echipa Growth",
  Aplicație: "Echipa Mobile", Suport: "Echipa CX", "Asistență specială": "Echipa CX",
};

function build(): Ticket[] {
  const totals: Record<string, number> = {};
  for (const s of seeds) totals[s.clusterId] = (totals[s.clusterId] ?? 0) + s.nrRaportari;
  const list: Ticket[] = seeds.map((s, i) => ({
    dataDeschiderii: `2026-10-${String(1 + (i % 20)).padStart(2, "0")}`,
    canal: ["Web", "Email", "Rețele sociale", "Call center"][i % 4] ?? "Web",
    functionalitate: s.categorie,
    descriere: s.titlu + ".",
    pasiVerificare: null,
    severitateSursa: "excel",
    versiuneRaportata: "3.12.0",
    versiuneFix: null,
    dataLivrareFix: null,
    echipa: ECHIPE[s.categorie] ?? "Echipa Core",
    tichetLegat: null,
    redeschisDeAgent: false,
    ultimaVerificare: null,
    ...s,
    totalRaportariCluster: totals[s.clusterId] ?? s.nrRaportari,
    testabil: Boolean(s.pasiVerificare),
    prioritate: 0,
  }));
  return rerank(list);
}

export function rerank(list: Ticket[]): Ticket[] {
  const sorted = [...list].sort(comparaPrioritate);
  sorted.forEach((t, i) => (t.prioritate = i + 1));
  return sorted;
}

export function buildClusters(tickets: Ticket[]): Cluster[] {
  const map = new Map<string, Ticket[]>();
  for (const t of tickets) map.set(t.clusterId, [...(map.get(t.clusterId) ?? []), t]);
  return [...map.entries()].map(([id, ts]) => {
    const sev = ts.map((t) => t.severitate).filter(Boolean) as Severitate[];
    return {
      id,
      titlu: ts[0]?.titlu ?? id,
      ticketIds: ts.map((t) => t.id),
      totalRaportari: ts.reduce((a, t) => a + t.nrRaportari, 0),
      severitateMax: sev.sort((a, b) => SEVERITATE_RANG[a] - SEVERITATE_RANG[b])[0] ?? "Mică",
    };
  });
}

const raport = (
  id: string,
  ticketId: string,
  verdict: Raport["verdict"],
  pasiR: Raport["pasi"],
  explicatieAI: string,
  statusDupa: Status,
  durataSecunde: number,
  extra?: Partial<Raport>,
): Raport => ({
  id, ticketId, data: RULARE, versiuneTestata: "3.14.0", verdict, pasi: pasiR, explicatieAI,
  statusInainte: "Rezolvat – fix livrat", statusDupa, durataSecunde, ...extra,
});

function buildReports(): Raport[] {
  return [
    raport("R-1027-1", "WB-1027", "picat", [
      { nr: 1, actiune: "Autentifică-te cu contul de test", rezultat: "ok" },
      { nr: 2, actiune: "Deschide rezervarea WBT5PAX (5 pasageri)", rezultat: "ok" },
      { nr: 3, actiune: "Apasă „Fă check-in pentru toți”", rezultat: "picat", detalii: "Mesaj afișat: „Ceva nu a mers bine… (Cod CHK-500)”", selector: "button[data-testid='checkin-all']", durataMs: 8120 },
    ], "După apăsarea butonului de check-in pentru 5 pasageri, aplicația afișează eroarea „Ceva nu a mers bine… (Cod CHK-500)” în loc de boarding pass-uri. Fix-ul din 3.13.2 nu rezolvă problema pe 3.14.0.", "În lucru", 41, {
      eroriDom: [
        "Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'boardingPasses')",
        "POST /api/checkin/batch → 500 {\"code\":\"CHK-500\",\"passengers\":5}",
      ],
      stackTrace:
        "TypeError: Cannot read properties of undefined (reading 'boardingPasses')\n    at CheckInSummary.render (src/features/checkin/CheckInSummary.tsx:118:27)\n    at PassengerGroup.map (src/features/checkin/PassengerGroup.tsx:64:12)\n    at submitAll (src/features/checkin/submitAll.ts:41:9)",
    }),
    raport("R-1022-1", "WB-1022", "picat", [
      { nr: 1, actiune: "Deschide boarding pass-ul pentru zborul W6 3101", rezultat: "ok" },
      { nr: 2, actiune: "Mărește codul QR", rezultat: "picat", detalii: "Analiză vizuală: contrast insuficient", selector: "#boarding-pass canvas", durataMs: 3400 },
    ], "Analiza vizuală Gemini: pătrățelele QR sunt gri deschis #c9cdd6 pe alb, contrast insuficient pentru scannerele de la poartă.", "În lucru", 28, {
      eroriDom: ["Contrast QR #c9cdd6 pe #ffffff = 1.6:1 (minim cerut 4.5:1)"],
      stackTrace: null,
    }),
    raport("R-1036-1", "WB-1036", "picat", [
      { nr: 1, actiune: "Deschide boarding pass-ul pentru zborul W6 2207", rezultat: "ok" },
      { nr: 2, actiune: "Verifică afișarea codului QR", rezultat: "picat", detalii: "Analiză vizuală: contrast insuficient", selector: "#boarding-pass canvas", durataMs: 2980 },
    ], "Analiza vizuală Gemini: pătrățelele QR sunt gri deschis #c9cdd6 pe alb, contrast insuficient.", "În lucru", 25, {
      eroriDom: ["Contrast QR #c9cdd6 pe #ffffff = 1.6:1 (minim cerut 4.5:1)", "Android 14 · WebView 118 — culoare override din theme.css"],
      stackTrace: null,
    }),
    raport("R-1016-1", "WB-1016", "trecut", [
      { nr: 1, actiune: "Caută zborul W6 4410 (A321neo)", rezultat: "ok" },
      { nr: 2, actiune: "Selectează tariful Basic", rezultat: "ok" },
      { nr: 3, actiune: "Deschide pasul „Alege locul”", rezultat: "ok", detalii: "Harta afișată cu 239 de locuri" },
    ], "Harta de locuri se încarcă corect pentru A321neo.", "Rezolvat – fix livrat", 33),
    raport("R-1029-1", "WB-1029", "trecut", [
      { nr: 1, actiune: "Deschide rezervarea WBA321", rezultat: "ok" },
      { nr: 2, actiune: "Apasă „Schimbă locul”", rezultat: "ok", detalii: "Încărcare în 1,4 s" },
    ], "Harta se încarcă rapid, fără blocare în loading.", "Rezolvat – fix livrat", 19),
    raport("R-1008-1", "WB-1008", "trecut", [
      { nr: 1, actiune: "Adaugă un bagaj de cală de 20 kg", rezultat: "ok", detalii: "Preț afișat: 189 lei" },
      { nr: 2, actiune: "Notează prețul afișat", rezultat: "ok" },
      { nr: 3, actiune: "Continuă până la pagina de plată", rezultat: "ok", detalii: "Preț la plată: 189 lei" },
    ], "Prețul bagajului este consecvent: 189 lei la alegere = 189 lei la plată.", "Rezolvat – fix livrat", 37),
  ];
}

export interface MockState {
  tickets: Ticket[];
  reports: Raport[];
  impacts: PostReleaseImpact[];
  settings: { versiuneLive: string; intervalMinute: number; wizzBeesUrl: string };
  ultimaRulare: string | null;
  ruleazaAcum: boolean;
}

export function createMockState(): MockState {
  return {
    tickets: build(),
    reports: buildReports(),
    impacts: buildPostReleaseImpacts(),
    settings: { versiuneLive: "3.14.0", intervalMinute: 2, wizzBeesUrl: "http://localhost:5173" },
    ultimaRulare: new Date(Date.now() - 60000).toISOString(),
    ruleazaAcum: false,
  };
}

function buildPostReleaseImpacts(): PostReleaseImpact[] {
  const rows: Pick<PostReleaseImpact, "ticketId" | "reclamatiiInainte" | "reclamatiiDupa" | "schimbareProcent" | "trend" | "concluzie">[] = [
    { ticketId: "WB-1016", reclamatiiInainte: 100, reclamatiiDupa: 22, schimbareProcent: -78, trend: "scadere", concluzie: "fix_confirmat" },
    { ticketId: "WB-1029", reclamatiiInainte: 40, reclamatiiDupa: 10, schimbareProcent: -75, trend: "scadere", concluzie: "fix_confirmat" },
    { ticketId: "WB-1008", reclamatiiInainte: 30, reclamatiiDupa: 30, schimbareProcent: 0, trend: "stabil", concluzie: "necesita_monitorizare" },
    { ticketId: "WB-1027", reclamatiiInainte: 100, reclamatiiDupa: 125, schimbareProcent: 25, trend: "crestere", concluzie: "fix_invalidat" },
    { ticketId: "WB-1022", reclamatiiInainte: 40, reclamatiiDupa: 50, schimbareProcent: 25, trend: "crestere", concluzie: "fix_invalidat" },
    { ticketId: "WB-1036", reclamatiiInainte: 100, reclamatiiDupa: 140, schimbareProcent: 40, trend: "crestere", concluzie: "fix_invalidat" },
    { ticketId: "WB-1021", reclamatiiInainte: 80, reclamatiiDupa: 80, schimbareProcent: 0, trend: "stabil", concluzie: "necesita_monitorizare" },
  ];
  return rows.map((row) => ({ ...row, versiune: "3.14.0", dataRelease: "2026-10-16", zileAnalizate: 7, sursa: "date_demo" }));
}
