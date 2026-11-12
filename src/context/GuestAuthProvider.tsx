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
  guestIdToken,
  guestSignIn,
  guestSignOut,
  guestSignUp,
  subscribeGuestAuth,
} from "@/lib/guestAuth.client";
import { isGuestFirebaseConfigured } from "@/lib/guestFirebase";
import { staffSignOut } from "@/lib/staffAuth.client";

interface GuestAuthContextValue {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
    setGuestAccessTokenProvider(() => guestIdToken(user));
    return () => setGuestAccessTokenProvider(null);
  }, [user]);

  const value = useMemo<GuestAuthContextValue>(
    () => ({
      user,
      ready,
      configured,
      signIn: signInGuest,
      signUp: signUpGuest,
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
