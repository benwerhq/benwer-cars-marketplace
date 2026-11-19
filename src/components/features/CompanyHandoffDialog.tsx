"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CompanyHandoffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
  continueHref: string;
}

export function CompanyHandoffDialog({
  open,
  onOpenChange,
  companyName,
  continueHref,
}: CompanyHandoffDialogProps) {
  const t = useTranslations("carDetail");
  const company = companyName?.trim() || t("handoffCompanyFallback");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-foreground/40" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-surface p-5 shadow-md outline-none sm:p-6",
          )}
        >
          <Dialog.Title className="text-base font-semibold text-foreground sm:text-lg">
            {t("handoffTitle", { company })}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {t("handoffTrust", { company })}
          </Dialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              {t("handoffCancel")}
            </Button>
            <a
              href={continueHref}
              className={cn(
                buttonVariants({ variant: "primary" }),
                "h-11 w-full sm:w-auto",
              )}
            >
              {t("handoffContinue")}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
