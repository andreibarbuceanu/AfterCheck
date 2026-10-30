import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, Loader2, PlayCircle, LayoutDashboard, Ticket, FileText, Upload, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useRunVerification, useSchedulerStatus } from "@/hooks/useVerifix";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Prezentare generală", icon: LayoutDashboard },
  { to: "/tichete", label: "Tichete", icon: Ticket },
  { to: "/rapoarte", label: "Rapoarte", icon: FileText },
  { to: "/import", label: "Import", icon: Upload },
] as const;

function relativ(iso: string | null, now: number) {
  if (!iso) return "—";
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  return min === 0 ? "chiar acum" : `acum ${min} min`;
}

function SchedulerIndicator() {
  const { data } = useSchedulerStatus();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(i);
  }, []);
  const running = data?.ruleazaAcum;
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center" aria-hidden="true">
        <span className={cn("absolute inline-flex h-full w-full rounded-full bg-success", running ? "animate-ping opacity-75" : "animate-pulse opacity-60")} />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
      <div className="hidden items-center gap-2.5 rounded-full border xl:flex border-border/70 bg-card px-3.5 py-2 text-xs tabular-nums text-muted-foreground shadow-sm">
        {running ? (
          <span className="font-medium text-foreground">Agentul verifică acum…</span>
        ) : (
          <span>Ultima verificare: {relativ(data?.ultimaRulare ?? null, now)}</span>
        )}
      </div>
    </div>
  );
}

function VerifyButton() {
  const { data } = useSchedulerStatus();
  const run = useRunVerification();
  const qc = useQueryClient();
  const busy = !!data?.ruleazaAcum || run.isPending;
  const prev = useRef(false);
  useEffect(() => {
    const r = !!data?.ruleazaAcum;
    if (prev.current && !r) {
      toast.success("Verificare terminată");
      qc.invalidateQueries();
    }
    prev.current = r;
  }, [data?.ruleazaAcum, qc]);
  return (
    <Button variant="premium" disabled={busy} onClick={() => run.mutate(undefined, { onError: (e) => toast.error(e.message) })} className="shrink-0 rounded-full">
      {busy ? <Loader2 className="animate-spin" /> : <PlayCircle />}
      {busy ? "Se verifică…" : "Verifică acum"}
    </Button>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-sidebar-border/70 bg-sidebar px-5 py-8 md:flex">
      <Link to="/" aria-label="AfterCheck" className="mb-10 flex items-center gap-2.5 px-2 text-xl font-semibold">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-action">
          <BadgeCheck className="h-6 w-6" />
        </span>
        AfterCheck
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.to === "/" }}
            aria-label={n.label}
            className="flex h-12 items-center gap-3 rounded-2xl px-4 text-sm text-muted-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" }}
          >
            <n.icon className="h-[18px] w-[18px] shrink-0" />
            {n.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function TopBar() {
  const { tema, comuta } = useTheme();
  const etichetaTema = tema === "dark" ? "Fundal alb" : "Fundal negru";
  return (
    <header className="sticky top-0 z-20 flex min-h-20 flex-wrap items-center gap-3 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur sm:px-8">
      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={comuta} className="shrink-0 text-muted-foreground" aria-label={etichetaTema} title={etichetaTema}>
          {tema === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <SchedulerIndicator />
        <VerifyButton />
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <nav className="flex gap-1 overflow-x-auto border-b border-border/60 px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="shrink-0 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Placeholder({ text }: { text: string }) {
  return <div className="rounded-3xl border border-border/70 bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">{text}</div>;
}
