import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpApi, createMockApi } from "@/lib/api";
import { importFileError } from "@/lib/importFiles";

afterEach(() => vi.unstubAllGlobals());

describe("surse de import", () => {
  it("acceptă numai Excel pentru tichete", () => {
    expect(importFileError({ name: "tichete.xlsx" }, ".xlsx")).toBeNull();
    expect(importFileError({ name: "tichete.csv" }, ".xlsx")).not.toBeNull();
    expect(importFileError({ name: "tichete.xlsx.exe" }, ".xlsx")).not.toBeNull();
  });
  it("acceptă numai Excel pentru tichetele post-release", () => {
    expect(importFileError({ name: "post-release.xlsx" }, ".xlsx")).toBeNull();
    expect(importFileError({ name: "post-release.csv" }, ".xlsx")).not.toBeNull();
  });
  it("trimite feedback prin POST multipart cu cheia file și păstrează răspunsul", async () => {
    const response = { importate: 7, ticheteAsociate: 6, ignorate: 0, problemeNoi: 1 };
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => response });
    vi.stubGlobal("fetch", fetch);
    const file = new File([], "post-release.xlsx");
    expect(await createHttpApi("https://api.example.test").importPostReleaseFeedback(file)).toEqual(response);
    const call = fetch.mock.calls[0];
    expect(call?.[0]).toBe("https://api.example.test/api/post-release-tickets/import");
    const init = call?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.headers).toBeUndefined();
    const body = init.body as FormData;
    expect([...body.keys()]).toEqual(["file"]);
    expect((body.get("file") as File).name).toBe("post-release.xlsx");
  });
  it("păstrează endpointul Excel existent", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ importate: 1, severitatiCompletateDeAI: 0, clustere: 1 }) });
    vi.stubGlobal("fetch", fetch);
    await createHttpApi("https://api.example.test").importExcel(new File([], "tickets.xlsx"));
    expect(fetch.mock.calls[0]?.[0]).toBe("https://api.example.test/api/import");
    expect(fetch.mock.calls[0]?.[1].method).toBe("POST");
  });
  it("nu inventează rezultate feedback în modul mock", async () => {
    const api = createMockApi();
    const before = await api.getPostReleaseImpacts();
    await expect(api.importPostReleaseFeedback(new File([], "post-release.xlsx"))).rejects.toThrow("necesită conexiunea la server");
    expect(await api.getPostReleaseImpacts()).toEqual(before);
  });
});
