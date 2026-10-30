import { describe, expect, it } from "vitest";
import { comparaClustere, procentConfirmate, verificareCluster } from "@/lib/priority";
import type { Ticket } from "@/types";

const t = (p: Partial<Ticket>) => ({ status: "Nou", testabil: true, ultimaVerificare: null, ...p }) as Ticket;
const v = (verdict: "trecut" | "picat") => ({ verdict, data: "", versiuneTestata: "", raportId: "" });

describe("reguli dashboard", () => {
  it("picat câștigă în fața lui trecut", () => expect(verificareCluster([t({ ultimaVerificare: v("trecut") }), t({ ultimaVerificare: v("picat") })])).toBe("picat"));
  it("trecut dacă nu e niciun picat", () => expect(verificareCluster([t({ ultimaVerificare: v("trecut") })])).toBe("trecut"));
  it("manual pentru fix livrat netestabil", () => expect(verificareCluster([t({ status: "Rezolvat – fix livrat", testabil: false })])).toBe("manual"));
  it("un test trecut are întâietate față de verificarea manuală", () => {
    expect(verificareCluster([t({ status: "Rezolvat – fix livrat", testabil: false }), t({ ultimaVerificare: v("trecut") })])).toBe("trecut");
  });
  it("nimic altfel", () => expect(verificareCluster([t({})])).toBeNull());
  it("severitatea înaintea raportărilor", () => {
    const l = [{ severitateMax: "Mare" as const, totalRaportari: 900 }, { severitateMax: "Critică" as const, totalRaportari: 1 }, { severitateMax: "Mare" as const, totalRaportari: 950 }].sort(comparaClustere);
    expect(l.map((c) => c.totalRaportari)).toEqual([1, 950, 900]);
  });
  it("procent din fix-urile testate", () => {
    expect(procentConfirmate(3, 1)).toBe(75);
    expect(procentConfirmate(0, 0)).toBe(0);
  });
});
