"use client";

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  GUEST_FIREBASE_APP_NAME,
  guestAuthErrorKey,
  guestFirebaseWebConfig,
} from "./guestFirebase";

function guestApp(): FirebaseApp | null {
  const config = guestFirebaseWebConfig();
  if (!config || typeof window === "undefined") {
    return null;
  }

  const existing = getApps().find((app) => app.name === GUEST_FIREBASE_APP_NAME);
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
    GUEST_FIREBASE_APP_NAME,
  );
}

export function getGuestAuth(): Auth | null {
  try {
    const app =
      guestApp() ??
      (getApps().some((item) => item.name === GUEST_FIREBASE_APP_NAME)
        ? getApp(GUEST_FIREBASE_APP_NAME)
        : null);
    if (!app) {
      return null;
    }

    const auth = getAuth(app);
    const tenantId = guestFirebaseWebConfig()?.tenantId;
    if (tenantId) {
      auth.tenantId = tenantId;
    }
    return auth;
  } catch {
    return null;
  }
}

export function subscribeGuestAuth(
  onUser: (user: User | null) => void,
): () => void {
  const auth = getGuestAuth();
  if (!auth) {
    onUser(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, onUser);
}

export async function guestSignIn(
  email: string,
  password: string,
): Promise<void> {
  const auth = getGuestAuth();
  if (!auth) {
    throw new Error("guest.not_configured");
  }

  await signInWithEmailAndPassword(auth, email, password);
}

export async function guestSignUp(
  email: string,
  password: string,
): Promise<void> {
  const auth = getGuestAuth();
  if (!auth) {
    throw new Error("guest.not_configured");
  }

  await createUserWithEmailAndPassword(auth, email, password);
}

export async function guestSignInWithGoogle(): Promise<void> {
  const auth = getGuestAuth();
  if (!auth) {
    throw new Error("guest.not_configured");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(auth, provider);
}

export async function guestSendPasswordReset(email: string, locale: string): Promise<void> {
  const auth = getGuestAuth();
  if (!auth) {
    throw new Error("guest.not_configured");
  }

  auth.languageCode = locale.split("-")[0] ?? null;
  await sendPasswordResetEmail(auth, email, { url: window.location.href });
}

export async function guestSignOut(): Promise<void> {
  const auth = getGuestAuth();
  if (!auth) {
    return;
  }

  await signOut(auth);
}

export function firebaseErrorMessageKey(error: unknown): string {
  if (error instanceof Error && error.message === "guest.not_configured") {
    return "guest.disabledTitle";
  }

  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";
  return guestAuthErrorKey(code);
}

export async function guestIdToken(user: User | null): Promise<string | null> {
  if (!user) {
    return null;
  }

  return user.getIdToken();
}
