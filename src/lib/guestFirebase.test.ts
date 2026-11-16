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

describe("guestAuthErrorKey for Google sign-in", () => {
  it("maps popup and provider errors", () => {
    expect(guestAuthErrorKey("auth/popup-closed-by-user")).toBe("guest.auth.popupClosed");
    expect(guestAuthErrorKey("auth/popup-blocked")).toBe("guest.auth.popupBlocked");
    expect(guestAuthErrorKey("auth/operation-not-allowed")).toBe("guest.auth.googleDisabled");
    expect(guestAuthErrorKey("auth/unauthorized-domain")).toBe("guest.auth.domainNotAuthorised");
    expect(guestAuthErrorKey("auth/unauthorized-continue-uri")).toBe(
      "guest.auth.providerUnavailable",
    );
    expect(guestAuthErrorKey("auth/account-exists-with-different-credential")).toBe(
      "guest.auth.differentProvider",
    );
  });
});
