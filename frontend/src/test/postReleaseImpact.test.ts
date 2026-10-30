import { describe, expect, it, vi, afterEach } from "vitest";
import { createHttpApi, createMockApi } from "@/lib/api";
import { countReducedProblems, findLatestImpact, impactTrend } from "@/lib/postReleaseImpact";
import { createMockState } from "@/lib/mockData";

afterEach(() => vi.unstubAllGlobals());

describe("impact după release", () => {
  it("folosește exclusiv endpointul convenit", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetch);
    expect(await createHttpApi("https://api.example.test").getPostReleaseImpacts()).toEqual([]);
    expect(fetch).toHaveBeenCalledWith("https://api.example.test/api/post-release-impact", undefined);
  });
  it("are șapte impacturi demo pentru tichete existente, cu perioade de șapte zile", () => {
    const state = createMockState();
    expect(state.impacts).toHaveLength(7);
    expect(new Set(state.impacts.map((i) => i.ticketId)).size).toBe(7);
    for (const impact of state.impacts) {
      expect(state.tickets.some((t) => t.id === impact.ticketId)).toBe(true);
      expect(impact.sursa).toBe("date_demo");
      expect(impact.zileAnalizate).toBe(7);
      expect(impact.schimbareProcent).toBe(Math.round((impact.reclamatiiDupa - impact.reclamatiiInainte) / impact.reclamatiiInainte * 100));
    }
  });
  it("păstrează combinațiile de verdict tehnic și reclamații", () => {
    const { impacts, reports } = createMockState();
    expect(impacts.filter((i) => i.trend === "scadere").map((i) => reports.find((r) => r.ticketId === i.ticketId)?.verdict)).toEqual(["trecut", "trecut"]);
    expect(impacts.filter((i) => i.trend === "crestere").map((i) => reports.find((r) => r.ticketId === i.ticketId)?.verdict)).toEqual(["picat", "picat", "picat"]);
    expect(impacts.find((i) => i.ticketId === "WB-1008")?.concluzie).toBe("necesita_monitorizare");
    expect(reports.find((r) => r.ticketId === "WB-1008")?.verdict).toBe("trecut");
  });
  it("numără scăderile reclamațiilor independent de verdictul tehnic", () => {
    const impacts = createMockState().impacts;
    expect(countReducedProblems(impacts)).toBe(2);
    const first = impacts[0];
    if (!first) throw new Error("Missing fixture");
    expect(countReducedProblems([{ ...first, trend: "scadere", concluzie: "necesita_monitorizare" }])).toBe(1);
    expect(countReducedProblems([{ ...first, trend: "stabil", concluzie: "fix_confirmat" }])).toBe(0);
    const postImport = Array.from({ length: 7 }, (_, index) => ({
      ...first,
      ticketId: `post-import-${index}`,
      trend: index < 5 ? "scadere" as const : "stabil" as const,
      concluzie: index < 2 ? "fix_confirmat" as const : index < 5 ? "fix_invalidat" as const : "necesita_monitorizare" as const,
    }));
    expect(countReducedProblems(postImport)).toBe(5);
    expect(countReducedProblems([])).toBe(0);
  });
  it("nu asociază unui raport impactul altei versiuni", () => {
    const impacts = createMockState().impacts;
    expect(findLatestImpact(impacts, "WB-1016", "3.14.0")?.schimbareProcent).toBe(-78);
    expect(findLatestImpact(impacts, "WB-1016", "3.13.0")).toBeUndefined();
    expect(findLatestImpact(impacts, "missing")).toBeUndefined();
  });
  it("tendința este scădere cu magnitudine pozitivă sau creștere", () => {
    const impacts = createMockState().impacts;
    const decrease = impacts.find((i) => i.ticketId === "WB-1016");
    const increase = impacts.find((i) => i.ticketId === "WB-1027");
    if (!decrease || !increase) throw new Error("Missing fixture");
    expect(impactTrend(decrease).arrow).toBe("↓");
    expect(impactTrend(decrease).tone).toBe("text-success-ink");
    expect(impactTrend(decrease).label).toContain("78%");
    expect(impactTrend(increase).arrow).toBe("↑");
    expect(impactTrend(increase).tone).toBe("text-danger-ink");
  });
  it("resetarea elimină și impacturile demo", async () => {
    const api = createMockApi();
    expect(await api.getPostReleaseImpacts()).toHaveLength(7);
    await api.clearDemoData();
    expect(await api.getPostReleaseImpacts()).toEqual([]);
  });
});
