import { describe, expect, it } from "vitest";
import { createMockApi } from "@/lib/api";

describe("resetare date demo", () => {
  it("șterge toate tichetele și rapoartele și raportează câte au fost", async () => {
    const api = createMockApi();
    const t = (await api.getTickets()).length;
    const r = (await api.getReports()).length;
    expect(await api.clearDemoData()).toEqual({ ticheteSterse: t, rapoarteSterse: r });
    expect(await api.getTickets()).toHaveLength(0);
    expect(await api.getReports()).toHaveLength(0);
  });
});
