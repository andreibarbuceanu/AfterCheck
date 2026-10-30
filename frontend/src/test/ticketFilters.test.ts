import { describe, expect, it } from "vitest";
import { createMockState } from "@/lib/mockData";
import { advancedFilterCount, filterTickets, parseTicketFilters, ticketVerdict, verificationDisabledReason } from "@/lib/ticketFilters";

const tickets = createMockState().tickets;
const base = tickets[0];
if (!base) throw new Error("Missing ticket fixture");

describe("filtre tichete", () => {
  it("Necesită atenție include fixuri invalidate, redeschise și manuale fără duplicate", () => {
    const t = { ...base, status: "Rezolvat – fix livrat" as const, testabil: true, redeschisDeAgent: false };
    const result = filterTickets([
      { ...t, id: "invalidat", ultimaVerificare: { verdict: "picat" as const, data: "", versiuneTestata: "", raportId: "" } },
      { ...t, id: "redeschis", redeschisDeAgent: true, ultimaVerificare: null },
      { ...t, id: "manual", testabil: false, ultimaVerificare: null },
      { ...t, id: "nou", status: "Nou" as const, ultimaVerificare: null },
    ], { rapid: "atentie" });
    expect(result.map((ticket) => ticket.id)).toEqual(["invalidat", "redeschis", "manual"]);
  });
  it("Confirmate include numai verdictul trecut și păstrează filtrele avansate", () => {
    const t = { ...base, status: "Rezolvat – fix livrat" as const, testabil: true, ultimaVerificare: { verdict: "trecut" as const, data: "", versiuneTestata: "", raportId: "" } };
    expect(filterTickets([{ ...t, id: "confirmat", categorie: "Plăți" }, { ...t, id: "alta-categorie", categorie: "Altele" }, { ...t, id: "picat", categorie: "Plăți", ultimaVerificare: { ...t.ultimaVerificare, verdict: "picat" as const } }], { rapid: "confirmate", categorie: "Plăți" }).map((ticket) => ticket.id)).toEqual(["confirmat"]);
  });
  it("Toate elimină doar filtrul rapid, iar URL-ul păstrează selecția", () => {
    const filters = parseTicketFilters({ rapid: "atentie", status: "Nou" });
    expect(filters.rapid).toBe("atentie");
    expect(filterTickets([{ ...base, id: "nou", status: "Nou", ultimaVerificare: null, redeschisDeAgent: false }, { ...base, id: "in-lucru", status: "În lucru" }], { ...filters, rapid: undefined }).map((ticket) => ticket.id)).toEqual(["nou"]);
  });
  it("citește statusul simplu din URL și selecțiile multiple", () => {
    expect(parseTicketFilters({ status: "În lucru", verdict: "picat" })).toMatchObject({ status: ["În lucru"], verdict: "picat" });
    expect(parseTicketFilters({ status: ["Nou", "În lucru"] }).status).toEqual(["Nou", "În lucru"]);
  });
  it("folosește prioritatea din backend, nu severitatea", () => {
    expect(filterTickets([{ ...base, id: "A", prioritate: 9, severitate: "Critică" }, { ...base, id: "B", prioritate: 2, severitate: "Mică" }], {}).map((t) => t.id)).toEqual(["B", "A"]);
  });
  it("caută în ID, titlu și descriere", () => {
    const t = { ...base, id: "ID-unic", titlu: "Titlu distinct", descriere: "Descriere specială" };
    for (const q of ["id-unic", "DISTINCT", "specială"]) expect(filterTickets([t], { q })).toHaveLength(1);
    expect(filterTickets([t], { q: "inexistent" })).toHaveLength(0);
  });
  it("combină toate filtrele", () => {
    const t = { ...base, status: "În lucru" as const, severitate: "Mare" as const, categorie: "Plăți", testabil: true, redeschisDeAgent: true, ultimaVerificare: { verdict: "picat" as const, data: "", versiuneTestata: "", raportId: "" } };
    const f = { status: ["Nou", "În lucru"], severitate: ["Mare"], categorie: "Plăți", verdict: "picat", testabil: true, redeschisDeAgent: true };
    expect(filterTickets([t, { ...t, testabil: false }, { ...t, redeschisDeAgent: false }, { ...t, categorie: "Altele" }, { ...t, severitate: "Mică" }, { ...t, status: "Închis – nu se reproduce" }, { ...t, ultimaVerificare: null }], f)).toEqual([t]);
  });
  it("verificarea manuală are prioritate pentru fixuri netestabile", () => {
    expect(ticketVerdict({ ...base, status: "Rezolvat – fix livrat", testabil: false })).toBe("manual");
    expect(ticketVerdict({ ...base, status: "Nou", ultimaVerificare: null })).toBe("neverificat");
  });
  it("Doar testabile și Doar redeschise filtrează valorile true", () => {
    expect(filterTickets([{ ...base, id: "yes", testabil: true, redeschisDeAgent: true }, { ...base, id: "no", testabil: false, redeschisDeAgent: false }], { testabil: true, redeschisDeAgent: true }).map((t) => t.id)).toEqual(["yes"]);
  });
  it("verificarea individuală este permisă doar pentru fix livrat testabil", () => {
    expect(verificationDisabledReason({ ...base, status: "Rezolvat – fix livrat", testabil: true })).toBeUndefined();
    expect(verificationDisabledReason({ ...base, status: "Nou", testabil: true })).toBeDefined();
    expect(verificationDisabledReason({ ...base, status: "Rezolvat – fix livrat", testabil: false })).toBeDefined();
  });
  it("badge-ul Filtre numără doar status, severitate și categorie", () => {
    expect(advancedFilterCount({})).toBe(0);
    expect(advancedFilterCount({ status: ["Nou"], severitate: ["Mare"], categorie: "Plăți", verdict: "picat", rapid: "atentie", q: "x" })).toBe(3);
  });
});