import { describe, expect, it } from "vitest";
import { staffFirebaseWebConfig } from "./staffFirebase";

describe("staffFirebaseWebConfig", () => {
  it("requires the staff web SDK fields", () => {
    expect(
      staffFirebaseWebConfig({
        apiKey: "k",
        authDomain: "admin.firebaseapp.com",
        projectId: "staff",
      }),
    ).toBeNull();
    expect(
      staffFirebaseWebConfig({
        apiKey: "k",
        authDomain: "admin.firebaseapp.com",
        projectId: "staff",
        appId: "1:2:web:3",
      })?.projectId,
    ).toBe("staff");
  });
});
