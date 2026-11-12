import { describe, expect, it } from "vitest";
import { extraLineTotal, extrasTotal, isAirportBranch, mapExtras, TIME_SLOTS } from "./extras";

const extras = mapExtras({
  data: [
    { id: "seat", kind: "child_seat", name: { en: "Child seat" }, type: "per_day", price: "5.5", availableQuantity: 3 },
    { id: "gps", kind: "gps", name: { en: "GPS" }, type: "fixed", price: 20, availableQuantity: null },
    { id: "broken", type: "fixed" },
  ],
});

describe("mapExtras", () => {
  it("maps the public extras list and skips rows without a price", () => {
    expect(extras.map((extra) => extra.id)).toEqual(["seat", "gps"]);
    expect(extras[0]?.price).toBe(5.5);
  });
});

describe("extras totals", () => {
  it("charges per-day extras per day and fixed extras once", () => {
    expect(extraLineTotal(extras[0]!, 3)).toBe(16.5);
    expect(extraLineTotal(extras[1]!, 3)).toBe(20);
    expect(extrasTotal(extras, ["seat", "gps"], 3)).toBe(36.5);
    expect(extrasTotal(extras, [], 3)).toBe(0);
  });
});

describe("isAirportBranch", () => {
  it("spots airport desks in en, es and pt", () => {
    expect(isAirportBranch({ name: "Malaga Airport" })).toBe(true);
    expect(isAirportBranch({ name: "Oficina", address: "Aeropuerto de Malaga, T3" })).toBe(true);
    expect(isAirportBranch({ name: "Aeroporto de Faro" })).toBe(true);
    expect(isAirportBranch({ name: "Centro", address: "Calle Larios 1" })).toBe(false);
    expect(isAirportBranch(null)).toBe(false);
  });
});

describe("TIME_SLOTS", () => {
  it("runs every half hour from 07:00 to 22:00", () => {
    expect(TIME_SLOTS[0]).toBe("07:00");
    expect(TIME_SLOTS[1]).toBe("07:30");
    expect(TIME_SLOTS.at(-1)).toBe("22:00");
  });
});
