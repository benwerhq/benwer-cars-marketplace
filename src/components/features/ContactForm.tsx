"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Send } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ContactTopic, NavRoutes } from "@/enums";
import { useContact } from "@/hooks/useContact";
import {
  createContactSchema,
  type ContactFormValues,
} from "@/lib/contactSchema";
import { getErrorKey } from "@/lib/errors";

interface ContactFormProps {
  topic?: ContactTopic;
}

export function ContactForm({ topic }: ContactFormProps) {
  const t = useTranslations("contact");
  const tNav = useTranslations("nav");
  const tRoot = useTranslations();
  const [submitted, setSubmitted] = useState(false);
  const schema = createContactSchema({
    nameMin: t("errors.nameMin"),
    email: t("errors.email"),
    subjectMin: t("errors.subjectMin"),
    messageMin: t("errors.messageMin"),
  });
  const defaultValues: ContactFormValues = {
    name: "",
    email: "",
    subject: topic === ContactTopic.SUPPORT ? t("supportSubjectDefault") : "",
    message: "",
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const contact = useContact(() => setSubmitted(true));

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface px-6 py-12 text-center sm:px-10 sm:py-14"
      >
        <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-success-soft">
          <Check
            size={44}
            strokeWidth={2.4}
            className="text-success"
            aria-hidden
          />
        </div>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
          {t("submittedTitle")}
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("submittedDescription")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={NavRoutes.HOME}
            className={buttonVariants({ size: "lg" })}
          >
            <ArrowLeft size={16} aria-hidden />
            {t("backHome")}
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              reset(defaultValues);
              contact.reset();
              setSubmitted(false);
            }}
          >
            {t("sendAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 sm:p-8"
      onSubmit={handleSubmit((values) => contact.mutate(values))}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t("name")}
          htmlFor="name"
          error={errors.name?.message}
          required
        >
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            className="h-11"
            {...register("name")}
          />
        </Field>
        <Field
          label={t("email")}
          htmlFor="email"
          error={errors.email?.message}
          required
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder={t("emailPlaceholder")}
            className="h-11"
            {...register("email")}
          />
        </Field>
      </div>
      <Field
        label={t("subject")}
        htmlFor="subject"
        error={errors.subject?.message}
        required
      >
        <Input
          id="subject"
          type="text"
          placeholder={t("subjectPlaceholder")}
          className="h-11"
          {...register("subject")}
        />
      </Field>
      <Field
        label={t("message")}
        htmlFor="message"
        error={errors.message?.message}
        required
      >
        <Textarea
          id="message"
          rows={6}
          placeholder={t("messagePlaceholder")}
          className="resize-none"
          {...register("message")}
        />
      </Field>
      {contact.isError ? (
        <p
          role="alert"
          className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {tRoot(getErrorKey(contact.error))}
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        isLoading={contact.isPending}
        className="w-full"
      >
        {contact.isPending ? t("submitting") : t("submit")}
        {contact.isPending ? null : <Send size={16} aria-hidden />}
      </Button>
      <p className="text-sm text-muted-foreground">
        {t("privacyNote")}{" "}
        <Link
          href={NavRoutes.PRIVACY}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {tNav("privacy")}
        </Link>
      </p>
    </form>
  );
}
