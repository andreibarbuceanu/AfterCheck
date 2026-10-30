import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClearDemoData, useImport, useImportPostReleaseFeedback } from "@/hooks/useVerifix";
import { importFileError } from "@/lib/importFiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import · AfterCheck" },
      { name: "description", content: "Importă tichetele inițiale și tichetele apărute după release în AfterCheck." },
      { property: "og:title", content: "Import · AfterCheck" },
      { property: "og:description", content: "Importă tichetele inițiale și tichetele apărute după release în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  const imp = useImport();
  const feedback = useImportPostReleaseFeedback();
  return (
    <>
      <PageHeader title="Import" />
      <div className="space-y-10">
        <section aria-labelledby="ticket-import-title">
          <h2 id="ticket-import-title" className="text-lg font-semibold">Tichete</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">Fișier Excel cu problemele raportate și pașii de verificare.</p>
          <UploadZone title="Tichete" extension=".xlsx" pending={imp.isPending} onImport={(file) => imp.mutate(file)} onReset={() => imp.reset()} error={imp.error?.message} />
          {imp.data && (
            <div role="status" className="mt-4 space-y-4 border-l-2 border-border pl-4">
              <p className="text-sm font-medium tabular-nums">{imp.data.importate} tichete importate · {imp.data.severitatiCompletateDeAI} severități completate de AI · {imp.data.clustere} probleme identificate</p>
              <Button asChild variant="premium" className="max-w-full whitespace-normal"><Link to="/">Mergi la Prezentare generală</Link></Button>
            </div>
          )}
        </section>
        <section aria-labelledby="feedback-import-title" className="border-t border-border pt-8">
          <h2 id="feedback-import-title" className="text-lg font-semibold">Tichete post-release</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">Fișier Excel cu problemele raportate după lansarea noii versiuni.</p>
          <UploadZone title="Tichete post-release" extension=".xlsx" pending={feedback.isPending} onImport={(file) => feedback.mutate(file)} onReset={() => feedback.reset()} error={feedback.error?.message} />
          {feedback.data && (
            <div role="status" className="mt-4 space-y-2 border-l-2 border-border pl-4 text-sm">
              <p className="font-medium tabular-nums">{feedback.data.importate} tichete importate · {feedback.data.ticheteAsociate} probleme reapărute · {feedback.data.problemeNoi} probleme noi</p>
            </div>
          )}
        </section>
      </div>
      <ResetDemoData />
    </>
  );
}

function UploadZone({ title, extension, pending, onImport, onReset, error }: {
  title: string;
  extension: ".xlsx";
  pending: boolean;
  onImport: (file: File) => void;
  onReset: () => void;
  error: string | undefined;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const trimite = (file?: File) => {
    if (!file || pending) return;
    onReset();
    const validation = importFileError(file, extension);
    setFileError(validation);
    if (!validation) onImport(file);
  };
  return (
    <>
      <Button
        variant="outline"
        disabled={pending}
        aria-label={`Încarcă ${title} ${extension}`}
        aria-busy={pending}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!pending) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); trimite(e.dataTransfer.files[0]); }}
        className={cn("h-auto min-h-40 w-full flex-col gap-3 whitespace-normal rounded-3xl border-2 border-dashed border-border bg-card px-6 py-8 text-center shadow-none hover:bg-muted/50", drag && "border-primary bg-primary/5")}
      >
        {pending ? <Loader2 className="!size-7 animate-spin text-primary" /> : <Upload className="!size-7 text-muted-foreground" />}
        <span>{pending ? "Se importă…" : `Trage aici fișierul ${extension} sau apasă ca să-l alegi`}</span>
      </Button>
      <input ref={ref} type="file" aria-label={`Fișier ${title}`} accept={extension} disabled={pending} className="hidden" onChange={(e) => { trimite(e.target.files?.[0]); e.target.value = ""; }} />
      {(fileError || error) && <p role="alert" className="mt-4 break-words rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{fileError || error}</p>}
    </>
  );
}

function ResetDemoData() {
  const clear = useClearDemoData();
  const [open, setOpen] = useState(false);
  const confirma = () => {
    setOpen(false);
    clear.mutate(undefined, {
      onSuccess: (r) => toast.success(`Date șterse: ${r.ticheteSterse} tichete și ${r.rapoarteSterse} rapoarte`),
      onError: (e) => toast.error(e.message),
    });
  };
  return (
    <div className="mt-10 flex justify-end border-t border-border/60 pt-4">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={clear.isPending} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            {clear.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {clear.isPending ? "Se șterg…" : "Resetează datele demo"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetează datele demo</AlertDialogTitle>
            <AlertDialogDescription>Ștergi toate tichetele și rapoartele? Setările aplicației vor fi păstrate.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={confirma} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Șterge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
