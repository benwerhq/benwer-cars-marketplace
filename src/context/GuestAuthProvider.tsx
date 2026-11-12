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
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string, locale: string) => Promise<void>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    if (!configured) {
      return;
    }

    return subscribeGuestAuth((next) => {
      setUser(next);
      setReady(true);
    });
  }, [configured]);

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
    }),
    [configured, ready, user],
  );

  return (
    <GuestAuthContext.Provider value={value}>
      {children}
    </GuestAuthContext.Provider>
  );
}

export function useGuestAuth(): GuestAuthContextValue {
  const value = useContext(GuestAuthContext);
  if (!value) {
    throw new Error("useGuestAuth requires GuestAuthProvider");
  }

  return value;
}
