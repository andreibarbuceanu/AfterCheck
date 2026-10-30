import type { PostReleaseImpact } from "@/types";

export const impactConclusions = {
  fix_confirmat: { label: "Fix rezolvat", tone: "tone-success", explanation: "Testul tehnic a trecut, iar reclamațiile au scăzut după release." },
  necesita_monitorizare: { label: "Necesită monitorizare", tone: "tone-neutral text-foreground", explanation: "Testul tehnic a trecut, dar reclamațiile nu au scăzut suficient." },
  fix_invalidat: { label: "Fix nerezolvat", tone: "tone-danger", explanation: "Verificarea tehnică a picat, iar problema trebuie redeschisă." },
} as const;

export function impactTrend(impact: PostReleaseImpact, complaints = false) {
  if (impact.trend === "stabil") return { arrow: "", label: "Fără schimbare", tone: "text-muted-foreground" };
  const percentage = Math.abs(impact.schimbareProcent).toLocaleString("ro-RO", { maximumFractionDigits: 1 });
  return {
    arrow: impact.trend === "scadere" ? "↓" : "↑",
    label: `${percentage}%${complaints ? " reclamații" : ""}`,
    tone: impact.trend === "scadere" ? "text-success-ink" : "text-danger-ink",
  };
}

export const countReducedProblems = (impacts: PostReleaseImpact[]) =>
  impacts.filter((impact) => impact.trend === "scadere").length;

export function findLatestImpact(impacts: PostReleaseImpact[], ticketId: string, version?: string) {
  return impacts.filter((impact) => impact.ticketId === ticketId && (!version || impact.versiune === version))
    .sort((a, b) => b.dataRelease.localeCompare(a.dataRelease))[0];
}
