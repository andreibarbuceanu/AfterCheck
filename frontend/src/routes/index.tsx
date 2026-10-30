import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock3, ListChecks, RotateCcw, TrendingDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { PageHeader } from "@/components/AppHeader";
import { SeveritateBadge } from "@/components/badges";
import { comparaClustere, verificareCluster } from "@/lib/priority";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TicketDetails } from "@/components/TicketDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { useClusters, usePostReleaseImpacts, useStats, useTickets } from "@/hooks/useVerifix";
import { countReducedProblems } from "@/lib/postReleaseImpact";
import { overviewVerification } from "@/lib/overviewStats";
import { cn } from "@/lib/utils";
import type { Stats } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prezentare generală · AfterCheck" },
      { name: "description", content: "AfterCheck — Post-Release Inner Loop Intelligence & AI Testing Agent. Verificare automată a fix-urilor livrate." },
      { property: "og:title", content: "Prezentare generală · AfterCheck" },
      { property: "og:description", content: "AfterCheck: fix-uri rezolvate, invalidate și tichete care necesită monitorizare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Kpi({ label, value, icon, tone, footer, to }: { label: string; value?: number | string | undefined; icon: ReactNode; tone: string; footer?: ReactNode; to?: "/tichete" }) {
  const card = (
    <div className={cn("group flex h-full flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md motion-reduce:transform-none", to && "cursor-pointer")}>
      <div className="flex min-h-14 flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:gap-3 text-sm font-medium leading-5 text-muted-foreground">
        <span className="max-w-[220px] pt-1">{label}</span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 bg-muted/60 text-muted-foreground transition-[background-color,color,transform] duration-200 group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary motion-reduce:transform-none sm:h-11 sm:w-11">{icon}</span>
      </div>
      <div className={cn("mt-5 text-3xl font-extrabold sm:text-4xl tabular-nums", tone)}>
        {value === undefined ? <Skeleton className="h-9 w-16" /> : value}
      </div>
      {footer && <div className="mt-3 text-xs leading-5 text-muted-foreground">{footer}</div>}
    </div>
  );
  return to ? <Link to={to} className="block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{card}</Link> : card;
}

const donutConfig = {
  confirmate: { label: "Fix-uri rezolvate", color: "var(--ink)" },
  invalidate: { label: "Fix-uri nerezolvate", color: "var(--t-danger-fg)" },
  monitorizare: { label: "Necesită monitorizare", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function DonutChart({ data }: { data: Stats | undefined }) {
  if (!data) return null;
  const { confirmate, invalidate, monitorizare, procentConfirmate: pct } = overviewVerification(data);
  const chartData = [
    { name: donutConfig.confirmate.label, key: "confirmate", value: confirmate, fill: donutConfig.confirmate.color },
    { name: donutConfig.invalidate.label, key: "invalidate", value: invalidate, fill: donutConfig.invalidate.color },
    { name: donutConfig.monitorizare.label, key: "monitorizare", value: monitorizare, fill: donutConfig.monitorizare.color },
  ];
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold">Fixuri verificate</h3>
      <div className="grid items-center gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
        <ChartContainer config={donutConfig} className="mx-auto aspect-square h-[220px] w-[220px] max-w-full">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={75} outerRadius={100} paddingAngle={4} cornerRadius={7} strokeWidth={0}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink text-3xl font-extrabold tabular-nums"
            >
              {pct}%
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
              din totalul tichetelor
            </text>
          </PieChart>
        </ChartContainer>
        <ul className="grid w-full divide-y divide-border/60">
          {chartData.map((entry) => (
            <li key={entry.key} className="flex items-center gap-3 py-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.fill }} />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
              <span className="ml-auto text-lg font-bold tabular-nums text-ink">{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Business impact and release efficacy. */
function SintezaExecutiva({ data }: { data: Stats | undefined }) {
  if (!data) return <Skeleton className="mt-7 h-72 w-full rounded-3xl" />;
  const eficacitate = data.totalTichete ? Math.round((data.fixuriConfirmate / data.totalTichete) * 100) : 0;
  return (
    <section className="mt-12 border-t border-border/60 pt-8">
      <h2 className="text-base font-semibold">Sinteză executivă</h2>
      <div className="mt-5 grid items-center gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <dl className="grid grid-cols-2 gap-4">
          <div className="border-l-2 border-primary pl-4">
            <dt className="text-xs text-muted-foreground">Eficacitatea fix-urilor</dt>
            <dd className="mt-2 text-3xl font-extrabold tabular-nums text-ink">{eficacitate}%</dd>
          </div>
          <div className="border-l-2 border-border pl-4">
            <dt className="text-xs text-muted-foreground">Rată redeschidere</dt>
            <dd className="mt-2 text-3xl font-extrabold tabular-nums text-ink">{Math.round(data.rataRedeschidere * 100)}%</dd>
          </div>
        </dl>
        <DonutChart data={data} />
      </div>
    </section>
  );
}

function Prioritati() {
  const { data: clustere, error: clusterError } = useClusters();
  const { data: tichete, error: ticketError } = useTickets();
  const [selectat, setSelectat] = useState<string | null>(null);
  if (clusterError || ticketError) return <p className="mt-8 text-sm text-destructive">{(clusterError ?? ticketError)?.message}</p>;
  if (!clustere || !tichete) return <Skeleton className="mt-8 h-96 w-full rounded-3xl" />;
  const vizibile = [...clustere].sort(comparaClustere).slice(0, 5);
  const verdicturi = {
    picat: { label: "Fix nerezolvat", tone: "tone-danger" },
    trecut: { label: "Fix rezolvat", tone: "tone-neutral" },
    manual: { label: "Verificare manuală", tone: "tone-neutral" },
    neverificat: { label: "Neverificat", tone: "tone-neutral" },
  };
  return (
    <TooltipProvider>
      <section className="mt-12">
        <h2 className="text-base font-semibold">Priorități</h2>
        <ol className="mt-4 grid gap-3">
          {vizibile.map((c, i) => {
            const asociate = tichete.filter((t) => c.ticketIds.includes(t.id));
            const verdict = verdicturi[verificareCluster(asociate) ?? "neverificat"];
            const tichet = asociate[0];
            return (
              <li key={c.id}>
                <Button
                  variant="outline"
                  disabled={!tichet}
                  onClick={() => { if (tichet) setSelectat(tichet.id); }}
                  className="group h-auto w-full justify-start gap-3 whitespace-normal rounded-2xl border-border/60 bg-card p-4 text-left shadow-sm hover:bg-muted/40 sm:gap-4 sm:p-5"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-5">
                    <span className="line-clamp-2 break-words text-sm font-semibold text-foreground sm:text-base">{c.titlu}</span>
                    <span className="flex flex-wrap items-center gap-2 sm:row-start-2">
                      <SeveritateBadge severitate={c.severitateMax} sursa={asociate.some((t) => t.severitateSursa === "llm") ? "llm" : "excel"} />
                      <span className="text-xs tabular-nums text-muted-foreground">{c.totalRaportari} raportări</span>
                    </span>
                    <span className={cn("w-fit rounded-full border px-2.5 py-1 text-xs font-medium sm:col-start-2 sm:row-span-2 sm:row-start-1", verdict.tone)}>{verdict.label}</span>
                  </span>
                  <ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                </Button>
              </li>
            );
          })}
        </ol>
        {vizibile.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nicio prioritate de afișat.</p>}
        <Button asChild variant="link" className="mt-3 px-0"><Link to="/tichete">Vezi toate prioritățile <ArrowRight /></Link></Button>
      </section>
      <TicketDetails ticket={tichete.find((t) => t.id === selectat)} onClose={() => setSelectat(null)} />
    </TooltipProvider>
  );
}

function Index() {
  const { data, error } = useStats();
  const impacts = usePostReleaseImpacts();
  return (
    <>
      <PageHeader title="Prezentare generală" />
      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <Kpi label="Total tichete" value={data?.totalTichete} icon={<ListChecks className="h-5 w-5" />} tone="text-ink" to="/tichete" />
        <Kpi label="Fix-uri rezolvate" value={data?.fixuriConfirmate} icon={<CheckCircle2 className="h-5 w-5" />} tone="text-ink" to="/tichete" />
        <Kpi label="Fix-uri nerezolvate" value={data?.fixuriInvalidate} icon={<RotateCcw className="h-5 w-5" />} tone="text-ink" to="/tichete" />
        <Kpi
          label="Necesită monitorizare"
          value={impacts.isPending ? undefined : impacts.error || !impacts.data?.length || !data ? "—" : overviewVerification(data).monitorizare}
          icon={<Clock3 className="h-5 w-5" />}
          tone="text-ink"
          to="/tichete"
        />
        <Kpi label="Probleme reduse după release" value={impacts.isPending ? undefined : impacts.error || !impacts.data?.length ? "—" : countReducedProblems(impacts.data)} icon={<TrendingDown className="h-5 w-5" />} tone="text-ink" to="/tichete" />
      </div>
      <Prioritati />
      <SintezaExecutiva data={data} />
    </>
  );
}
