import { env } from "@/env";

export const GUEST_FIREBASE_APP_NAME = "guest";

export interface GuestFirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  tenantId: string | null;
}

export function guestFirebaseWebConfig(
  source: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    appId?: string;
    tenantId?: string;
  } = {
    apiKey: env.NEXT_PUBLIC_GUEST_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_GUEST_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_GUEST_FIREBASE_PROJECT_ID,
    appId: env.NEXT_PUBLIC_GUEST_FIREBASE_APP_ID,
    tenantId: env.NEXT_PUBLIC_GUEST_FIREBASE_TENANT_ID,
  },
): GuestFirebaseWebConfig | null {
  const apiKey = source.apiKey?.trim() ?? "";
  const authDomain = source.authDomain?.trim() ?? "";
  const projectId = source.projectId?.trim() ?? "";
  const appId = source.appId?.trim() ?? "";
  const tenantId = source.tenantId?.trim() || null;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return { apiKey, authDomain, projectId, appId, tenantId };
}

export function isGuestFirebaseConfigured(): boolean {
  return guestFirebaseWebConfig() !== null;
}

export function guestAuthErrorKey(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "guest.auth.invalidEmail";
    case "auth/email-already-in-use":
      return "guest.auth.emailInUse";
    case "auth/weak-password":
      return "guest.auth.weakPassword";
    case "auth/too-many-requests":
      return "guest.auth.tooManyRequests";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "guest.auth.popupClosed";
    case "auth/popup-blocked":
      return "guest.auth.popupBlocked";
    case "auth/account-exists-with-different-credential":
      return "guest.auth.differentProvider";
    case "auth/operation-not-allowed":
    case "auth/unauthorized-domain":
    case "auth/unauthorized-continue-uri":
      return "guest.auth.providerUnavailable";
    case "auth/network-request-failed":
      return "errors.network";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "guest.auth.invalidCredentials";
    default:
      return "guest.auth.unknown";
  }
}
