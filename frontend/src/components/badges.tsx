import { cn } from "@/lib/utils";
import type { Severitate, Status, Verdict } from "@/types";

const base = "inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors";

const STATUS_CLS: Record<Status, string> = {
  Nou: "tone-neutral",
  "În lucru": "tone-neutral",
  "Rezolvat – fix livrat": "tone-neutral",
  "Închis – nu se reproduce": "tone-neutral",
};
export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn(base, STATUS_CLS[status])}>{status}</span>;
}

const SEV_CLS: Record<Severitate, string> = {
  Critică: "tone-neutral",
  Mare: "tone-neutral",
  Medie: "tone-neutral",
  Mică: "tone-neutral",
};
export function SeveritateBadge({ severitate, sursa }: { severitate: Severitate | null; sursa?: "excel" | "llm" }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn(base, severitate ? SEV_CLS[severitate] : "tone-neutral")}>{severitate ?? "—"}</span>
      {sursa === "llm" && (
        <span className={cn(base, "tone-neutral px-1.5")} title="Severitate completată de AI">
          AI
        </span>
      )}
    </span>
  );
}

export function VerdictBadge({ verdict, emphasis = false }: { verdict: Verdict | "manual"; emphasis?: boolean }) {
  const map = {
    trecut: [emphasis ? "tone-success" : "tone-neutral", "✓ Trecut"],
    picat: ["tone-danger", "✗ Picat"],
    eroare: ["tone-neutral", "Eroare"],
    manual: ["tone-neutral", "Verificare manuală"],
  } as const;
  const [cls, label] = map[verdict];
  return <span className={cn(base, cls)}>{label}</span>;
}
