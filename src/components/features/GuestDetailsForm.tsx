"use client";

import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGuestAccount, useUpdateGuestProfile } from "@/hooks/useGuestAccount";
import { formatLongDate, parseIsoDate } from "@/lib/dates";
import { getErrorKey } from "@/lib/errors";
import type { GuestCustomer } from "@/types/guest";

const E164 = /^\+[1-9]\d{1,14}$/;

/** Name, phone and date of birth saved on the company's customer record. */
export function GuestDetailsSection({ companySlug }: { companySlug: string }) {
  const t = useTranslations("guest");
  const account = useGuestAccount(companySlug);
  const customer = account.data?.customer ?? null;
  const [editing, setEditing] = useState(false);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{t("profileDetailsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("profileDetailsHint")}</p>
        </div>
        {customer && !editing ? (
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={16} aria-hidden />
            {t("profileEdit")}
          </Button>
        ) : null}
      </div>
      {account.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : customer ? (
        editing ? (
          <GuestDetailsForm
            key={customer.id}
            companySlug={companySlug}
            customer={customer}
            onDone={() => setEditing(false)}
          />
        ) : (
          <GuestDetailsSummary
            customer={customer}
            email={account.data?.email ?? customer.email}
          />
        )
      ) : (
        <p className="text-sm text-muted-foreground">{t("profileNotLinked")}</p>
      )}
    </section>
  );
}

function GuestDetailsSummary({
  customer,
  email,
}: {
  customer: GuestCustomer;
  email: string;
}) {
  const t = useTranslations("guest");
  const locale = useLocale();
  const birthDate = customer.dateOfBirth ? parseIsoDate(customer.dateOfBirth) : null;
  const rows = [
    { label: t("profileFullName"), value: customer.fullName },
    { label: t("profileEmail"), value: email },
    { label: t("profilePhone"), value: customer.phone },
    {
      label: t("profileDob"),
      value: birthDate ? formatLongDate(birthDate, locale) : "",
    },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="min-w-0 rounded-xl bg-surface-muted px-4 py-3">
          <dt className="text-xs text-muted-foreground">{row.label}</dt>
          <dd
            className={
              row.value
                ? "mt-0.5 truncate text-sm font-medium text-foreground"
                : "mt-0.5 text-sm text-subtle-foreground"
            }
          >
            {row.value || t("profileEmpty")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function GuestDetailsForm({
  companySlug,
  customer,
  onDone,
}: {
  companySlug: string;
  customer: GuestCustomer;
  onDone: () => void;
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
    update.mutate(
      {
        fullName: fullName.trim(),
        phone: cleanPhone || undefined,
        dateOfBirth: dateOfBirth || null,
      },
      { onSuccess: onDone },
    );
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
        <Button type="button" variant="ghost" onClick={onDone} disabled={update.isPending}>
          {t("profileCancel")}
        </Button>
        {update.error ? (
          <p className="text-sm text-danger" role="alert">
            {tRoot(getErrorKey(update.error))}
          </p>
        ) : null}
      </div>
    </form>
  );
}
