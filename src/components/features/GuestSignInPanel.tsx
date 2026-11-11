"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { firebaseErrorMessageKey } from "@/lib/guestAuth.client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export function GuestSignInPanel() {
  const t = useTranslations("guest");
  const tRoot = useTranslations();
  const { signIn, signUp } = useGuestAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrorKey(null);
    try {
      if (mode === "up") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setErrorKey(firebaseErrorMessageKey(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {mode === "up" ? t("createTitle") : t("signInTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "up" ? t("createHint") : t("signInHint")}
        </p>
      </div>
      <Field label={t("email")} htmlFor="guest-email" required>
        <Input
          id="guest-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>
      <Field label={t("password")} htmlFor="guest-password" required>
        <Input
          id="guest-password"
          type="password"
          autoComplete={mode === "up" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
      </Field>
      {errorKey ? (
        <p className="text-sm text-danger" role="alert">
          {tRoot(errorKey)}
        </p>
      ) : null}
      <Button type="submit" isLoading={busy}>
        {mode === "up" ? t("createAction") : t("signInAction")}
      </Button>
      <button
        type="button"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        onClick={() => {
          setMode(mode === "up" ? "in" : "up");
          setErrorKey(null);
        }}
      >
        {mode === "up" ? t("haveAccount") : t("needAccount")}
      </button>
    </form>
  );
}
