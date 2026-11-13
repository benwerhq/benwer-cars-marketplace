import { describe, expect, it } from "vitest";
import {
  AVAILABILITY_WINDOW_MONTHS,
  availabilityCalendarWindow,
} from "./availability";
import { parseIsoDate } from "./dates";

describe("availabilityCalendarWindow", () => {
  it("queries twelve months from the given day", () => {
    const today = parseIsoDate("2026-11-12");
    expect(today).not.toBeNull();
    expect(AVAILABILITY_WINDOW_MONTHS).toBe(12);
    expect(availabilityCalendarWindow(today!)).toEqual({
      from: "2026-11-12",
      to: "2027-11-12",
    });
  });
});
