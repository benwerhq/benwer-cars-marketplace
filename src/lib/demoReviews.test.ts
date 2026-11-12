import { describe, expect, it } from "vitest";
import { withDemoReviews } from "./demoReviews";

const empty = { average: null, count: 0, items: [] };

describe("withDemoReviews", () => {
  it("adds demo reviews for the Benwer HQ test company when it has none", () => {
    const result = withDemoReviews("c1000000-0000-7000-8000-000000000001", empty);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("leaves other companies untouched", () => {
    expect(withDemoReviews("another-company", empty)).toBe(empty);
  });

  it("keeps real reviews when the test company has some", () => {
    const real = {
      average: 4,
      count: 1,
      items: [{ id: "r1", rating: 4, text: "Great", createdAt: "" }],
    };
    expect(withDemoReviews("c1000000-0000-7000-8000-000000000001", real)).toBe(real);
  });
});
