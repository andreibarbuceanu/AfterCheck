import { usePostReleaseImpacts } from "@/hooks/useVerifix";
import { findLatestImpact, impactConclusions, impactTrend } from "@/lib/postReleaseImpact";
import { cn } from "@/lib/utils";
import type { PostReleaseImpact } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function ImpactTrendBadge({ impact, complaints = false }: { impact: PostReleaseImpact; complaints?: boolean }) {
  const trend = impactTrend(impact, complaints);
  if (!trend.arrow) return <span className="text-sm tabular-nums text-muted-foreground">{trend.label}</span>;
  return <span className="text-sm tabular-nums text-foreground"><span aria-hidden="true" className={cn("font-semibold", trend.tone)}>{trend.arrow}</span> {trend.label}</span>;
}

export function PostReleaseImpactCard({ ticketId, version }: { ticketId: string; version: string }) {
  const { data, isPending, error } = usePostReleaseImpacts();
  const impact = findLatestImpact(data ?? [], ticketId, version);
  const conclusion = impact ? impactConclusions[impact.concluzie] : undefined;
  if (!isPending && !error && !impact) return null;
  return (
    <section aria-labelledby="impact-heading" className="mb-6 rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-6">
      <h2 id="impact-heading" className="font-semibold">Impact după release</h2>
      {isPending ? <Skeleton className="mt-4 h-28 w-full rounded-xl" /> : error ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">Impactul post-release nu a putut fi încărcat.</p>
      ) : !impact || !conclusion ? (
        <p className="mt-3 text-sm text-muted-foreground">Impactul post-release nu este încă disponibil.</p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 items-center gap-4 sm:grid-cols-3">
            <div><dt className="text-xs text-muted-foreground">Raportări inițiale</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{impact.reclamatiiInainte}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Raportări post-release</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{impact.reclamatiiDupa}</dd></div>
            <div className="col-span-2 sm:col-span-1"><dt className="mb-1 text-xs text-muted-foreground">Evoluție</dt><dd><ImpactTrendBadge impact={impact} /></dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <span>v{impact.versiune}</span>
            <span className={cn("rounded-full px-2.5 py-1 font-medium", conclusion.tone)}>{conclusion.label}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{conclusion.explanation}</p>
        </>
      )}
    </section>
  );
}
