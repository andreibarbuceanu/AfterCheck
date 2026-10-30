import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/AppHeader";
import { StatusBadge, VerdictBadge } from "@/components/badges";
import { EroriTehnice, PasiRaport } from "@/components/ReportSteps";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport } from "@/hooks/useVerifix";
import { PostReleaseImpactCard } from "@/components/PostReleaseImpact";

export const Route = createFileRoute("/rapoarte_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Raport ${params.id} · AfterCheck` },
      { name: "description", content: `Raportul agentului AI pentru ${params.id}.` },
      { property: "og:title", content: `Raport ${params.id} · AfterCheck` },
      { property: "og:description", content: `Raportul agentului AI pentru ${params.id}.` },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RaportPage,
});

function RaportPage() {
  const { id } = Route.useParams();
  const { data: r, error } = useReport(id);
  if (error) return <p className="text-sm text-destructive">{error.message}</p>;
  if (!r) return <Skeleton className="h-96 w-full rounded-3xl" />;
  return (
    <>
      <Link to="/rapoarte" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">← Rapoarte</Link>
      <PageHeader title={`Raport ${r.id}`} subtitle={`${r.ticketId} · v${r.versiuneTestata} · ${new Date(r.data).toLocaleString("ro-RO")} · ${r.durataSecunde}s`} />
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <span className="scale-125 origin-left"><VerdictBadge verdict={r.verdict} emphasis /></span>
        <span className="ml-6 flex items-center gap-2 text-sm"><StatusBadge status={r.statusInainte} /><ArrowRight className="h-4 w-4 text-muted-foreground" /><StatusBadge status={r.statusDupa} /></span>
      </div>
      <div className="mb-6 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <h2 className="mb-2 font-semibold">Explicația AI</h2>
        <p className="text-sm leading-6 text-muted-foreground">{r.explicatieAI}</p>
      </div>
      <PostReleaseImpactCard ticketId={r.ticketId} version={r.versiuneTestata} />
      <div className="mb-6 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Pași</h2>
        <PasiRaport pasi={r.pasi} />
      </div>
      {(!!r.eroriDom?.length || r.stackTrace) && (
        <details className="group rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">Detalii tehnice <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
          <div className="mt-4 grid gap-3"><EroriTehnice raport={r} /></div>
        </details>
      )}
    </>
  );
}
