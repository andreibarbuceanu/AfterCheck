import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppHeader";
import { VerdictBadge } from "@/components/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostReleaseImpacts, useReports } from "@/hooks/useVerifix";
import { ImpactTrendBadge } from "@/components/PostReleaseImpact";
import { findLatestImpact } from "@/lib/postReleaseImpact";

export const Route = createFileRoute("/rapoarte")({
  head: () => ({
    meta: [
      { title: "Rapoarte · AfterCheck" },
      { name: "description", content: "Rapoartele AI Testing Agent în AfterCheck." },
      { property: "og:title", content: "Rapoarte · AfterCheck" },
      { property: "og:description", content: "Rapoartele AI Testing Agent în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rapoarte,
});

function Rapoarte() {
  const { data, error } = useReports();
  const impacts = usePostReleaseImpacts();
  const nav = useNavigate();
  const lista = [...(data ?? [])].sort((a, b) => b.data.localeCompare(a.data));
  const hasPostRelease = (impacts.data?.length ?? 0) > 0;
  return (
    <>
      <PageHeader title="Rapoarte" />
      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}
      {impacts.error && <p role="status" className="mb-4 text-xs text-muted-foreground">Impactul post-release nu a putut fi încărcat.</p>}
      {!data ? (
        <Skeleton className="h-80 w-full rounded-3xl" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border/50 bg-card p-4 shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="p-3 font-medium">Data</th><th className="p-3 font-medium">Tichet</th><th className="p-3 font-medium">Versiune</th><th className="p-3 font-medium">Verdict</th>{hasPostRelease && <th className="p-3 font-medium">Impact clienți</th>}<th className="p-3 font-medium">Pasul picat</th><th className="p-3 font-medium">Durată</th></tr>
            </thead>
            <tbody>
              {lista.map((r) => {
                const picat = r.pasi.find((p) => p.rezultat === "picat");
                const impact = findLatestImpact(impacts.data ?? [], r.ticketId, r.versiuneTestata);
                return (
                  <tr key={r.id} onClick={() => nav({ to: "/rapoarte/$id", params: { id: r.id } })} className="cursor-pointer border-t border-border/60 hover:bg-muted/40">
                    <td className="p-3 tabular-nums">{new Date(r.data).toLocaleString("ro-RO")}</td>
                    <td className="p-3 font-mono text-xs">{r.ticketId}</td>
                    <td className="p-3 tabular-nums">v{r.versiuneTestata}</td>
                    <td className="p-3"><VerdictBadge verdict={r.verdict} /></td>
                    {hasPostRelease && <td className="p-3">{impact ? <ImpactTrendBadge impact={impact} complaints /> : <span className="text-xs text-muted-foreground">Fără asociere</span>}</td>}
                    <td className="p-3 text-muted-foreground">{picat ? `${picat.nr}. ${picat.actiune}` : "—"}</td>
                    <td className="p-3 tabular-nums">{r.durataSecunde}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
