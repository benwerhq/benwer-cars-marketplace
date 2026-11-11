import { describe, expect, it } from "vitest";
import {
  guestAuthErrorKey,
  guestFirebaseWebConfig,
} from "./guestFirebase";

describe("guestFirebaseWebConfig", () => {
  it("returns null unless the guest web SDK env is complete", () => {
    expect(
      guestFirebaseWebConfig({
        apiKey: "key",
        authDomain: "guest.firebaseapp.com",
        projectId: "guest-proj",
      }),
    ).toBeNull();
    expect(
      guestFirebaseWebConfig({
        apiKey: "key",
        authDomain: "guest.firebaseapp.com",
        projectId: "guest-proj",
        appId: "1:2:web:3",
        tenantId: "tenant-a",
      }),
    ).toEqual({
      apiKey: "key",
      authDomain: "guest.firebaseapp.com",
      projectId: "guest-proj",
      appId: "1:2:web:3",
      tenantId: "tenant-a",
    });
  });
});

describe("guestAuthErrorKey", () => {
  it("does not enumerate missing accounts", () => {
    expect(guestAuthErrorKey("auth/user-not-found")).toBe(
      "guest.auth.invalidCredentials",
    );
    expect(guestAuthErrorKey("auth/wrong-password")).toBe(
      "guest.auth.invalidCredentials",
    );
  });
});
