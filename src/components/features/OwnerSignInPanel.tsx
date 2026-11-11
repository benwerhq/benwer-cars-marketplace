"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { staffFirebaseErrorKey } from "@/lib/staffAuth.client";
import { isStaffFirebaseConfigured } from "@/lib/staffFirebase";
import { EmptyState } from "@/components/ui/EmptyState";
import { Shield } from "lucide-react";

interface OwnerSignInPanelProps {
  homeHref: string;
}

export function OwnerSignInPanel({ homeHref }: OwnerSignInPanelProps) {
  const t = useTranslations("owner");
  const tRoot = useTranslations();
  const router = useRouter();
  const { signIn, user, ready } = useStaffAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  if (!isStaffFirebaseConfigured()) {
    return (
      <EmptyState
        icon={<Shield size={28} />}
        title={t("disabledTitle")}
        description={t("disabledDescription")}
      />
    );
  }

  if (ready && user) {
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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrorKey(null);
    try {
      await signIn(email, password);
      router.push(homeHref);
    } catch (error) {
      setErrorKey(staffFirebaseErrorKey(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("signInHint")}</p>
      </div>
      <Field label={t("email")} htmlFor="owner-email" required>
        <Input
          id="owner-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>
      <Field label={t("password")} htmlFor="owner-password" required>
        <Input
          id="owner-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>
      {errorKey ? (
        <p className="text-sm text-danger" role="alert">
          {tRoot(errorKey)}
        </p>
      ) : null}
      <Button type="submit" isLoading={busy}>
        {t("signInAction")}
      </Button>
    </form>
  );
}
