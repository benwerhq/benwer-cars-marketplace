"use client";

import {
  FirebaseError,
  initializeApp,
  getApp,
  getApps,
  type FirebaseApp,
} from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
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

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendVerification(credential.user);
}

const CONTINUE_URL_ERRORS = new Set([
  "auth/unauthorized-continue-uri",
  "auth/invalid-continue-uri",
  "auth/missing-continue-uri",
]);

async function sendVerification(user: User): Promise<void> {
  const auth = getGuestAuth();
  if (auth && !auth.languageCode) {
    auth.languageCode = document.documentElement.lang.split("-")[0] || null;
  }
  try {
    await sendEmailVerification(user, { url: window.location.href });
  } catch (error) {
    if (error instanceof FirebaseError && CONTINUE_URL_ERRORS.has(error.code)) {
      await sendEmailVerification(user);
      return;
    }
    throw error;
  }
}

export async function guestSendEmailVerification(locale: string): Promise<void> {
  const auth = getGuestAuth();
  const user = auth?.currentUser;
  if (!auth || !user) {
    throw new Error("guest.unauthenticated");
  }

  auth.languageCode = locale.split("-")[0] ?? null;
  await sendVerification(user);
}

/** Re-reads the user from Firebase and refreshes the ID token so the API sees a newly verified email. */
export async function guestReloadUser(): Promise<boolean> {
  const user = getGuestAuth()?.currentUser;
  if (!user) {
    return false;
  }

  await user.reload();
  await user.getIdToken(true);
  return user.emailVerified;
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
