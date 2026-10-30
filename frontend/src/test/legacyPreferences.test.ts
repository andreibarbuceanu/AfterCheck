import { beforeEach, expect, it } from "vitest";
import { clearLegacyPreferences } from "@/lib/legacyPreferences";

beforeEach(() => localStorage.clear());

it("elimină preferința Developer fără a salva un rol implicit", () => {
  localStorage.setItem("aftercheck.rol", "dev");
  localStorage.setItem("verifix.rol", "pm");
  clearLegacyPreferences(localStorage);
  expect(localStorage.getItem("aftercheck.rol")).toBeNull();
  expect(localStorage.getItem("verifix.rol")).toBeNull();
  expect(localStorage.length).toBe(0);
});

it("păstrează tema și celelalte preferințe", () => {
  localStorage.setItem("aftercheck.tema", "light");
  localStorage.setItem("unrelated", "saved");
  clearLegacyPreferences(localStorage);
  expect(localStorage.getItem("aftercheck.tema")).toBe("light");
  expect(localStorage.getItem("unrelated")).toBe("saved");
  expect(localStorage.length).toBe(2);
});