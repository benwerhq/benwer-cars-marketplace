"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { setGuestAccessTokenProvider } from "@/lib/guestAccessToken";
import {
  getGuestAuth,
  guestIdToken,
  guestReloadUser,
  guestSendEmailVerification,
  guestSignIn,
  guestSignOut,
  guestSignUp,
  subscribeGuestAuth,
  guestSendPasswordReset,
  guestSignInWithGoogle,
} from "@/lib/guestAuth.client";
import { isGuestFirebaseConfigured } from "@/lib/guestFirebase";
import { staffSignOut } from "@/lib/staffAuth.client";

interface GuestAuthContextValue {
  user: User | null;
  ready: boolean;
  emailVerified: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string, locale: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: (locale: string) => Promise<void>;
  refreshVerification: () => Promise<boolean>;
}

async function signInGuest(email: string, password: string): Promise<void> {
  await staffSignOut();
  await guestSignIn(email, password);
}

async function signUpGuest(email: string, password: string): Promise<void> {
  await staffSignOut();
  await guestSignUp(email, password);
}

async function signInGuestWithGoogle(): Promise<void> {
  await staffSignOut();
  await guestSignInWithGoogle();
}

const GuestAuthContext = createContext<GuestAuthContextValue | null>(null);

export function GuestAuthProvider({ children }: { children: ReactNode }) {
  const configured = isGuestFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (!configured) {
      return;
    }

    return subscribeGuestAuth((next) => {
      setUser(next);
      setEmailVerified(Boolean(next?.emailVerified));
      setReady(true);
    });
  }, [configured]);

  useEffect(() => {
    if (!user || emailVerified) {
      return;
    }

    const recheck = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      void guestReloadUser()
        .then((verified) => {
          if (verified) {
            setEmailVerified(true);
          }
        })
        .catch(() => undefined);
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [emailVerified, user]);

  useEffect(() => {
    setGuestAccessTokenProvider(() => guestIdToken(getGuestAuth()?.currentUser ?? null));
    return () => setGuestAccessTokenProvider(null);
  }, []);

  const value = useMemo<GuestAuthContextValue>(
    () => ({
      user,
      ready,
      configured,
      signIn: signInGuest,
      signUp: signUpGuest,
      signInWithGoogle: signInGuestWithGoogle,
      resetPassword: guestSendPasswordReset,
      signOut: guestSignOut,
      emailVerified,
      sendVerificationEmail: guestSendEmailVerification,
      refreshVerification: async () => {
        const verified = await guestReloadUser();
        setEmailVerified(verified);
        return verified;
      },
    }),
    [configured, emailVerified, ready, user],
  );

  return (
    <GuestAuthContext.Provider value={value}>
      {children}
    </GuestAuthContext.Provider>
  );
}

/**
 * Guest auth when this page has a GuestAuthProvider (company sites), or null
 * (the marketplace /book page has no guest accounts).
 */
export function useOptionalGuestAuth(): GuestAuthContextValue | null {
  return useContext(GuestAuthContext);
}

export function useGuestAuth(): GuestAuthContextValue {
  const value = useContext(GuestAuthContext);
  if (!value) {
    throw new Error("useGuestAuth requires GuestAuthProvider");
  }

  return value;
}
