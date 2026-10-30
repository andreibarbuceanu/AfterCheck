import { describe, expect, it } from "vitest";
import { overviewVerification } from "@/lib/overviewStats";
import type { Stats } from "@/types";

const stats: Stats = {
  totalTichete: 7,
  ticheteDisponibile: 0,
  perStatus: { "Nou": 0, "În lucru": 0, "Rezolvat – fix livrat": 7, "Închis – nu se reproduce": 0 },
  fixuriConfirmate: 2,
  fixuriInvalidate: 3,
  necesitaVerificareManuala: 2,
  rataRedeschidere: 0,
  raportariPeCategorie: [],
};

describe("indicatori Prezentare generală", () => {
  it("citește cele trei categorii din Stats: 2, 3, 2", () => {
    expect(overviewVerification(stats)).toEqual({ confirmate: 2, invalidate: 3, monitorizare: 2, procentConfirmate: 29 });
  });
  it("nu deduce monitorizarea din total", () => {
    expect(overviewVerification({ ...stats, totalTichete: 100 }).monitorizare).toBe(2);
  });
  it("preferă numele viitor necesitaMonitorizare, inclusiv zero", () => {
    expect(overviewVerification({ ...stats, necesitaMonitorizare: 4 }).monitorizare).toBe(4);
    expect(overviewVerification({ ...stats, necesitaMonitorizare: 0 }).monitorizare).toBe(0);
  });
  it("procentul central este 2 / 7 = 29%, nu 2 / 5", () => {
    expect(overviewVerification(stats).procentConfirmate).toBe(29);
  });
  it("nu inventează valori pentru statistici goale", () => {
    expect(overviewVerification({ ...stats, totalTichete: 0, fixuriConfirmate: 0, fixuriInvalidate: 0, necesitaVerificareManuala: 0 })).toEqual({ confirmate: 0, invalidate: 0, monitorizare: 0, procentConfirmate: 0 });
  });
});