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
import { guestSignOut } from "@/lib/guestAuth.client";
import { setStaffAccessTokenProvider } from "@/lib/staffAccessToken";
import {
  getStaffAuth,
  staffIdToken,
  staffSignInWithToken,
  staffSignOut,
  subscribeStaffAuth,
} from "@/lib/staffAuth.client";
import { isStaffFirebaseConfigured } from "@/lib/staffFirebase";

interface StaffAuthContextValue {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signInWithToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

async function signInOwnerWithToken(token: string): Promise<void> {
  await guestSignOut();
  await staffSignInWithToken(token);
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const configured = isStaffFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) {
      return;
    }

    return subscribeStaffAuth((next) => {
      setUser(next);
      setReady(true);
    });
  }, [configured]);

  useEffect(() => {
    if (user) {
      void guestSignOut();
    }
  }, [user]);

  useEffect(() => {
    setStaffAccessTokenProvider(() => staffIdToken(getStaffAuth()?.currentUser ?? null));
    return () => setStaffAccessTokenProvider(null);
  }, []);

  const value = useMemo<StaffAuthContextValue>(
    () => ({
      user,
      ready,
      configured,
      signInWithToken: signInOwnerWithToken,
      signOut: staffSignOut,
    }),
    [configured, ready, user],
  );

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth(): StaffAuthContextValue {
  const value = useContext(StaffAuthContext);
  if (!value) {
    throw new Error("useStaffAuth requires StaffAuthProvider");
  }

  return value;
}
