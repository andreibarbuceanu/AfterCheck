import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { useClearDemoData, useImport, useImportPostReleaseFeedback, useRunVerification } from "@/hooks/useVerifix";

afterEach(() => vi.restoreAllMocks());

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(["post-release-impact"], []);
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

describe("actualizarea impactului după acțiuni", () => {
  it("importul feedbackului invalidează impactul", async () => {
    vi.spyOn(api, "importPostReleaseFeedback").mockResolvedValue({ importate: 7, ticheteAsociate: 6, ignorate: 0, problemeNoi: 1 });
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useImportPostReleaseFeedback(), { wrapper });
    await act(async () => { await result.current.mutateAsync(new File([], "feedback.csv")); });
    expect(client.getQueryState(["post-release-impact"])?.isInvalidated).toBe(true);
  });
  it("importul invalidează impactul", async () => {
    vi.spyOn(api, "importExcel").mockResolvedValue({ importate: 7, clustere: 7, severitatiCompletateDeAI: 0 });
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useImport(), { wrapper });
    await act(async () => { await result.current.mutateAsync(new File([], "demo.xlsx")); });
    expect(client.getQueryState(["post-release-impact"])?.isInvalidated).toBe(true);
  });
  it("resetarea invalidează impactul", async () => {
    vi.spyOn(api, "clearDemoData").mockResolvedValue({ ticheteSterse: 7, rapoarteSterse: 6 });
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useClearDemoData(), { wrapper });
    await act(async () => { await result.current.mutateAsync(); });
    expect(client.getQueryState(["post-release-impact"])?.isInvalidated).toBe(true);
  });
  it("verificarea invalidează impactul", async () => {
    vi.spyOn(api, "runVerification").mockResolvedValue({ ruleazaAcum: true, ultimaRulare: null, urmatoareaRulare: null });
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useRunVerification(), { wrapper });
    await act(async () => { await result.current.mutateAsync(undefined); });
    expect(client.getQueryState(["post-release-impact"])?.isInvalidated).toBe(true);
  });
});
