"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { returnToFromLocation } from "@/lib/returnTo";

function subscribe() {
  return () => {};
}

export function useReturnAfterSignIn(signedIn: boolean): boolean {
  const router = useRouter();
  const next = useSyncExternalStore(subscribe, returnToFromLocation, () => null);
  const returning = signedIn && next !== null;

  useEffect(() => {
    if (returning && next) {
      router.replace(next);
    }
  }, [returning, next, router]);

  return returning;
}
