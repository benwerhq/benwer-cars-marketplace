import { describe, expect, it } from "vitest";
import { ownerTokenFromHash, staffAuthErrorKey, staffFirebaseWebConfig } from "./staffFirebase";

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

describe("ownerTokenFromHash", () => {
  it("reads the admin hand-off token from the URL fragment", () => {
    expect(ownerTokenFromHash("#token=abc.def")).toBe("abc.def");
    expect(ownerTokenFromHash("token=abc")).toBe("abc");
    expect(ownerTokenFromHash("#token=")).toBeNull();
    expect(ownerTokenFromHash("")).toBeNull();
  });
});

describe("staffAuthErrorKey", () => {
  it("treats rejected hand-off tokens as expired links", () => {
    expect(staffAuthErrorKey("auth/invalid-custom-token")).toBe("owner.auth.invalidToken");
    expect(staffAuthErrorKey("auth/whatever")).toBe("owner.auth.unknown");
  });
});
