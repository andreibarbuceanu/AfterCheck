import type { Stats } from "@/types";

/** Accept a future server alias without changing the existing API contract. */
export function overviewVerification(stats: Stats & { necesitaMonitorizare?: number }) {
  return {
    confirmate: stats.fixuriConfirmate,
    invalidate: stats.fixuriInvalidate,
    monitorizare: stats.necesitaMonitorizare ?? stats.necesitaVerificareManuala,
    procentConfirmate: stats.totalTichete > 0
      ? Math.round(stats.fixuriConfirmate / stats.totalTichete * 100)
      : 0,
  };
}