"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  STAFF_FIREBASE_APP_NAME,
  staffAuthErrorKey,
  staffFirebaseWebConfig,
} from "./staffFirebase";

function staffApp(): FirebaseApp | null {
  const config = staffFirebaseWebConfig();
  if (!config || typeof window === "undefined") {
    return null;
  }

  const existing = getApps().find((app) => app.name === STAFF_FIREBASE_APP_NAME);
  if (existing) {
    return existing;
  }

  return initializeApp(
    {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId,
    },
    STAFF_FIREBASE_APP_NAME,
  );
}

export function getStaffAuth(): Auth | null {
  try {
    const app =
      staffApp() ??
      (getApps().some((item) => item.name === STAFF_FIREBASE_APP_NAME)
        ? getApp(STAFF_FIREBASE_APP_NAME)
        : null);
    if (!app) {
      return null;
    }

    const auth = getAuth(app);
    const tenantId = staffFirebaseWebConfig()?.tenantId;
    if (tenantId) {
      auth.tenantId = tenantId;
    }
    return auth;
  } catch {
    return null;
  }
}

export function subscribeStaffAuth(
  onUser: (user: User | null) => void,
): () => void {
  const auth = getStaffAuth();
  if (!auth) {
    onUser(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, onUser);
}

export async function staffSignIn(
  email: string,
  password: string,
): Promise<void> {
  const auth = getStaffAuth();
  if (!auth) {
    throw new Error("staff.not_configured");
  }

  await signInWithEmailAndPassword(auth, email, password);
}

export async function staffSignOut(): Promise<void> {
  const auth = getStaffAuth();
  if (auth) {
    await signOut(auth);
  }
}

export async function staffIdToken(user: User | null): Promise<string | null> {
  if (!user) {
    return null;
  }

  return user.getIdToken();
}

export function staffFirebaseErrorKey(error: unknown): string {
  if (error instanceof Error && error.message === "staff.not_configured") {
    return "owner.disabledTitle";
  }

  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";
  return staffAuthErrorKey(code);
}
