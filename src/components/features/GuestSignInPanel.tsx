"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { logError } from "@/lib/logger";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { firebaseErrorMessageKey } from "@/lib/guestAuth.client";
import { getStaffAuth } from "@/lib/staffAuth.client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { GoogleMark } from "./GoogleMark";

type PanelMode = "in" | "up" | "reset";

export function GuestSignInPanel() {
  const t = useTranslations("guest");
  const tRoot = useTranslations();
  const locale = useLocale();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useGuestAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<PanelMode>("in");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  /** Guest sign-in signs the owner out (by design); say so when an owner session was open. */
  function ownerSessionOpen(): boolean {
    return Boolean(getStaffAuth()?.currentUser);
  }

  function noticeOwnerSignedOut(hadOwner: boolean) {
    if (hadOwner) {
      toast.info(t("ownerSignedOut"));
    }
  }

  function switchMode(next: PanelMode) {
    setMode(next);
    setErrorKey(null);
    setResetSentTo(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrorKey(null);
    try {
      if (mode === "reset") {
        await resetPassword(email.trim(), locale);
        setResetSentTo(email.trim());
      } else {
        const hadOwner = ownerSessionOpen();
        await (mode === "up" ? signUp(email, password) : signIn(email, password));
        noticeOwnerSignedOut(hadOwner);
      }
    } catch (error) {
      setErrorKey(firebaseErrorMessageKey(error));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setGoogleBusy(true);
    setErrorKey(null);
    try {
      const hadOwner = ownerSessionOpen();
      await signInWithGoogle();
      noticeOwnerSignedOut(hadOwner);
    } catch (error) {
      logError(error, { context: "guest_google_sign_in" });
      setErrorKey(firebaseErrorMessageKey(error));
    } finally {
      setGoogleBusy(false);
    }
  }

  const backToSignIn = (
    <button
      type="button"
      className="cursor-pointer text-sm font-medium text-primary underline-offset-4 hover:underline"
      onClick={() => switchMode("in")}
    >
      {t("backToSignIn")}
    </button>
  );

  if (mode === "reset" && resetSentTo) {
    return (
      <div className="flex flex-col gap-4 mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("resetSentTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("resetSentHint")}</p>
        </div>
        <p className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground">
          {resetSentTo}
        </p>
        <Button type="button" onClick={() => switchMode("in")}>
          {t("backToSignIn")}
        </Button>
      </div>
    );
  }

  const title = mode === "reset" ? t("resetTitle") : mode === "up" ? t("createTitle") : t("signInTitle");
  const hint = mode === "reset" ? t("resetHint") : mode === "up" ? t("createHint") : t("signInHint");
  const action = mode === "reset" ? t("resetAction") : mode === "up" ? t("createAction") : t("signInAction");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </div>
      {mode === "reset" ? null : (
        <>
          <button
            type="button"
            onClick={() => void onGoogle()}
            disabled={googleBusy || busy}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-border-strong bg-surface text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleMark />
            {mode === "up" ? t("googleCreate") : t("googleAction")}
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
            <span className="h-px flex-1 bg-border" />
            {t("or")}
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
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
      {mode === "reset" ? null : (
        <div className="flex flex-col gap-1.5">
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
          {mode === "in" ? (
            <button
              type="button"
              className="w-fit cursor-pointer self-end text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => switchMode("reset")}
            >
              {t("forgotPassword")}
            </button>
          ) : null}
        </div>
      )}
      {errorKey ? (
        <p className="text-sm text-danger" role="alert">
          {tRoot(errorKey)}
        </p>
      ) : null}
      <Button type="submit" isLoading={busy} disabled={googleBusy}>
        {action}
      </Button>
      {mode === "reset" ? (
        <div className="text-center">{backToSignIn}</div>
      ) : (
        <button
          type="button"
          className="cursor-pointer text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => switchMode(mode === "up" ? "in" : "up")}
        >
          {mode === "up" ? t("haveAccount") : t("needAccount")}
        </button>
      )}
    </form>
  );
}
