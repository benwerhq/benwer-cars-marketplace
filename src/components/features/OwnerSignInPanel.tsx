"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ExternalLink, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { env } from "@/env";
import { logError } from "@/lib/logger";
import { staffFirebaseErrorKey } from "@/lib/staffAuth.client";
import { isStaffFirebaseConfigured, ownerTokenFromHash } from "@/lib/staffFirebase";

interface OwnerSignInPanelProps {
  homeHref: string;
}

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function OwnerSignInPanel({ homeHref }: OwnerSignInPanelProps) {
  const t = useTranslations("owner");
  const tRoot = useTranslations();
  const router = useRouter();
  const { signInWithToken, user, ready } = useStaffAuth();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const consumed = useRef(false);
  const configured = isStaffFirebaseConfigured();
  const token = ownerTokenFromHash(
    useSyncExternalStore(subscribeToHash, () => window.location.hash, () => ""),
  );

  useEffect(() => {
    if (!configured || !token || consumed.current) {
      return;
    }
    consumed.current = true;
    const clearToken = () =>
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    signInWithToken(token)
      .then(() => {
        clearToken();
        router.replace(homeHref);
      })
      .catch((error: unknown) => {
        clearToken();
        logError(error, { context: "owner_token_sign_in" });
        setErrorKey(staffFirebaseErrorKey(error));
      });
  }, [configured, homeHref, router, signInWithToken, token]);

  if (!configured) {
    return (
      <EmptyState
        icon={<Shield size={28} />}
        title={t("disabledTitle")}
        description={t("disabledDescription")}
      />
    );
  }

  if (token && !errorKey) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center" role="status">
        <Loader2 size={28} className="animate-spin text-primary motion-reduce:animate-none" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("signingIn")}</p>
      </div>
    );
  }

  if (ready && user && !errorKey) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("signedInTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("signedInHint")}</p>
        <Button type="button" onClick={() => router.push(homeHref)}>
          {t("openEditor")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {t("signInTitle")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("signInHint")}</p>
      {errorKey ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {tRoot(errorKey)}
        </p>
      ) : null}
      <a
        href={env.NEXT_PUBLIC_ADMIN_URL}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("openAdmin")}
        <ExternalLink size={15} aria-hidden />
      </a>
    </div>
  );
}
