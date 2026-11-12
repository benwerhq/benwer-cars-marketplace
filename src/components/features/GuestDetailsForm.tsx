"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useGuestAccount, useUpdateGuestProfile } from "@/hooks/useGuestAccount";
import { getErrorKey } from "@/lib/errors";
import type { GuestCustomer } from "@/types/guest";

const E164 = /^\+[1-9]\d{1,14}$/;

/** Name, phone and date of birth saved on the company's customer record. */
export function GuestDetailsSection({ companySlug }: { companySlug: string }) {
  const t = useTranslations("guest");
  const account = useGuestAccount(companySlug);
  const customer = account.data?.customer ?? null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold text-foreground">{t("profileDetailsTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("profileDetailsHint")}</p>
      {account.isPending ? null : customer ? (
        <GuestDetailsForm key={customer.id} companySlug={companySlug} customer={customer} />
      ) : (
        <p className="text-sm text-muted-foreground">{t("profileNotLinked")}</p>
      )}
    </section>
  );
}

function GuestDetailsForm({
  companySlug,
  customer,
}: {
  companySlug: string;
  customer: GuestCustomer;
}) {
  const t = useTranslations("guest");
  const tBooking = useTranslations("booking");
  const tRoot = useTranslations();
  const update = useUpdateGuestProfile(companySlug);
  const [fullName, setFullName] = useState(customer.fullName);
  const [phone, setPhone] = useState(customer.phone);
  const [dateOfBirth, setDateOfBirth] = useState(customer.dateOfBirth ?? "");
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPhone = phone.trim().replace(/[\s()-]/g, "");
    const next = {
      fullName: fullName.trim() ? undefined : tBooking("validation.nameMin"),
      phone: !cleanPhone || E164.test(cleanPhone) ? undefined : tBooking("validation.phone"),
    };
    setErrors(next);
    if (next.fullName || next.phone) {
      return;
    }
    update.mutate({
      fullName: fullName.trim(),
      phone: cleanPhone || undefined,
      dateOfBirth: dateOfBirth || null,
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label={t("profileFullName")} htmlFor="profileFullName" error={errors.fullName} required>
        <Input
          id="profileFullName"
          autoComplete="name"
          value={fullName}
          maxLength={120}
          onChange={(event) => setFullName(event.target.value)}
          className="h-11"
        />
      </Field>
      <Field label={t("profilePhone")} htmlFor="profilePhone" error={errors.phone}>
        <Input
          id="profilePhone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder={tBooking("guestPhonePlaceholder")}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="h-11"
        />
      </Field>
      <Field label={t("profileDob")} htmlFor="profileDob">
        <Input
          id="profileDob"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
          className="h-11"
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" isLoading={update.isPending}>
          {t("profileSave")}
        </Button>
        {update.isSuccess ? (
          <p className="text-sm text-muted-foreground" role="status">
            {t("profileSaved")}
          </p>
        ) : null}
        {update.error ? (
          <p className="text-sm text-danger" role="alert">
            {tRoot(getErrorKey(update.error))}
          </p>
        ) : null}
      </div>
    </form>
  );
}
