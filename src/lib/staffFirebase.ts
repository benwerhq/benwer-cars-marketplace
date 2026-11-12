import { env } from "@/env";

export const STAFF_FIREBASE_APP_NAME = "staff";

export interface StaffFirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  tenantId: string | null;
}

export function staffFirebaseWebConfig(
  source: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    appId?: string;
    tenantId?: string;
  } = {
    apiKey: env.NEXT_PUBLIC_STAFF_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_STAFF_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_STAFF_FIREBASE_PROJECT_ID,
    appId: env.NEXT_PUBLIC_STAFF_FIREBASE_APP_ID,
    tenantId: env.NEXT_PUBLIC_STAFF_FIREBASE_TENANT_ID,
  },
): StaffFirebaseWebConfig | null {
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

export function isStaffFirebaseConfigured(): boolean {
  return staffFirebaseWebConfig() !== null;
}

export function staffAuthErrorKey(code: string): string {
  switch (code) {
    case "auth/too-many-requests":
      return "owner.auth.tooManyRequests";
    case "auth/network-request-failed":
      return "errors.network";
    case "auth/invalid-custom-token":
    case "auth/custom-token-mismatch":
    case "auth/user-disabled":
      return "owner.auth.invalidToken";
    default:
      return "owner.auth.unknown";
  }
}

export const OWNER_TOKEN_HASH_KEY = "token";

export function ownerTokenFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.get(OWNER_TOKEN_HASH_KEY)?.trim() || null;
}
