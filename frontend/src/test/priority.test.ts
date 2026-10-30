import { describe, expect, it } from "vitest";
import { createMockState } from "@/lib/mockData";
import { computeStats } from "@/lib/api";
import { poatePrelua } from "@/lib/priority";

describe("prioritizare", () => {
  const t = createMockState().tickets;
  it("severitatea are întâietate față de raportări", () => {
    const iCritic = t.findIndex((x) => x.id === "WB-1011"); // Critică, 18 raportări
    const iMare = t.findIndex((x) => x.id === "WB-1026"); // Mare, 388 raportări
    expect(iCritic).toBeLessThan(iMare);
  });
  it("la aceeași severitate, clusterul cu mai multe raportări e primul", () => {
    const family = t.find((x) => x.id === "WB-1040");
    const assistance = t.find((x) => x.id === "WB-1011");
    if (!family || !assistance) throw new Error("Missing fixtures");
    expect(family.prioritate).toBeLessThan(assistance.prioritate);
  });
  it("Rezolvat fără pași = verificare manuală", () => {
    const s = computeStats(t);
    expect(s.necesitaVerificareManuala).toBe(3);
    expect(s.fixuriInvalidate).toBe(3);
    expect(s.fixuriConfirmate).toBe(3);
  });
});

describe("compatibilitate statistici", () => {
  const t = createMockState().tickets;
  it("păstrează numărul tichetelor disponibile din contractul API", () => {
    const s = computeStats(t);
    expect(s.ticheteDisponibile).toBe(6);
    expect(s.totalTichete).toBe(20);
  });
  it("un tichet deja accesat nu mai poate fi preluat", () => {
    for (const [id, available] of [["WB-1040", true], ["WB-1027", false], ["WB-1016", false]] as const) {
      const ticket = t.find((x) => x.id === id);
      if (!ticket) throw new Error("Missing fixture");
      expect(poatePrelua(ticket)).toBe(available);
    }
  });
});
