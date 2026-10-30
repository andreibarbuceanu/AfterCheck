import { describe, expect, it } from "vitest";
import { dataSimplaLabel, dateLabel, eDataSimpla, formatDateSimpla } from "@/lib/dates";

describe("dateLabel", () => {
  it("shows a date-only field as day.month.year without time", () => {
    expect(dateLabel("2026-08-17")).toBe("17.08.2026");
    expect(dateLabel("2026-10-05")).toBe("05.10.2026");
  });

  it("keeps a date-only field on the same day whatever the timezone", () => {
    expect(formatDateSimpla("2026-08-17")).toBe("17.08.2026");
    expect(eDataSimpla("2026-08-17")).toBe(true);
    expect(eDataSimpla("2026-08-17T22:10:00Z")).toBe(false);
  });

  it("shows a field that carries a time with the time", () => {
    expect(dateLabel("2026-08-17T14:30:00")).toBe("17.08.2026 14:30");
  });

  it("never shows a time for a calendar-only field, even if the backend adds one", () => {
    expect(dataSimplaLabel("2026-08-17")).toBe("17.08.2026");
    expect(dataSimplaLabel("2026-08-17T00:00:00Z")).toBe("17.08.2026");
    expect(dataSimplaLabel("2026-08-17T23:30:00+03:00")).toBe("17.08.2026");
    expect(dataSimplaLabel(null)).toBe("—");
  });

  it("shows a dash for missing values", () => {
    expect(dateLabel(null)).toBe("—");
    expect(dateLabel(undefined)).toBe("—");
  });
});
