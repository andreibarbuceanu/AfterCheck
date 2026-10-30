export type Severitate = "Critică" | "Mare" | "Medie" | "Mică";
export type Status = "Nou" | "În lucru" | "Rezolvat – fix livrat" | "Închis – nu se reproduce";
export type Verdict = "trecut" | "picat" | "eroare";

export type PostReleaseImpact = {
  ticketId: string;
  versiune: string;
  dataRelease: string;
  zileAnalizate: number;
  reclamatiiInainte: number;
  reclamatiiDupa: number;
  schimbareProcent: number;
  trend: "scadere" | "crestere" | "stabil";
  concluzie: "fix_confirmat" | "necesita_monitorizare" | "fix_invalidat";
  sursa: "date_demo";
};

export const STATUSURI: Status[] = ["Nou", "În lucru", "Rezolvat – fix livrat", "Închis – nu se reproduce"];
export const SEVERITATE_RANG: Record<Severitate, number> = { Critică: 1, Mare: 2, Medie: 3, Mică: 4 };

export interface Ticket {
  id: string;
  dataDeschiderii: string;
  canal: string;
  categorie: string;
  functionalitate: string;
  titlu: string;
  descriere: string;
  pasiVerificare: string | null;
  severitate: Severitate | null;
  severitateSursa: "excel" | "llm";
  nrRaportari: number;
  versiuneRaportata: string;
  status: Status;
  versiuneFix: string | null;
  dataLivrareFix: string | null;
  echipa: string;
  tichetLegat: string | null;
  clusterId: string;
  totalRaportariCluster: number;
  prioritate: number;
  testabil: boolean;
  redeschisDeAgent: boolean;
  ultimaVerificare: { verdict: Verdict; data: string; versiuneTestata: string; raportId: string } | null;
}
export interface Cluster {
  id: string;
  titlu: string;
  ticketIds: string[];
  totalRaportari: number;
  severitateMax: Severitate;
}
export interface PasRaport {
  nr: number;
  actiune: string;
  rezultat: "ok" | "picat" | "neexecutat";
  detalii?: string;
  screenshotUrl?: string;
  selector?: string;
  durataMs?: number;
}
export interface Raport {
  id: string;
  ticketId: string;
  data: string;
  versiuneTestata: string;
  verdict: Verdict;
  pasi: PasRaport[];
  explicatieAI: string;
  statusInainte: Status;
  statusDupa: Status;
  durataSecunde: number;
  eroriDom?: string[];
  stackTrace?: string | null;
}
export interface Stats {
  totalTichete: number;
  /** Tickets nobody has picked up yet — a developer can take these. */
  ticheteDisponibile: number;
  perStatus: Record<Status, number>;
  fixuriConfirmate: number;
  fixuriInvalidate: number;
  necesitaMonitorizare: number;
  necesitaVerificareManuala: number;
  rataRedeschidere: number;
  raportariPeCategorie: { categorie: string; raportari: number; tichete: number }[];
}
export interface SchedulerStatus {
  ruleazaAcum: boolean;
  ultimaRulare: string | null;
  urmatoareaRulare: string | null;
}
export interface ImportResult {
  importate: number;
  severitatiCompletateDeAI: number;
  clustere: number;
}
export interface PostReleaseFeedbackImportResult {
  importate: number;
  ticheteAsociate: number;
  ignorate: number;
  problemeNoi: number;
}
