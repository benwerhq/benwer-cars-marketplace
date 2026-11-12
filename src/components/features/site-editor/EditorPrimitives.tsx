"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { LocalizedCopy } from "@/types/siteContent";

export const editorSelectClass =
  "flex h-9 w-full cursor-pointer rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function EditorGroup({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-lg border border-border bg-surface p-4", className)}>
      {title || action ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EditorField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function LocalizedField({
  id,
  label,
  value,
  locale,
  onChange,
  placeholder,
  hint,
  multiline = false,
  tall = false,
  maxLength,
}: {
  id: string;
  label: string;
  value: LocalizedCopy;
  locale: string;
  onChange: (next: LocalizedCopy) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  tall?: boolean;
  maxLength?: number;
}) {
  const text = value[locale] ?? "";
  const update = (next: string) => {
    const copy = { ...value };
    if (next) {
      copy[locale] = next;
    } else {
      delete copy[locale];
    }
    onChange(copy);
  };

  return (
    <EditorField label={label} htmlFor={id} hint={hint}>
      {multiline ? (
        <Textarea
          id={id}
          value={text}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => update(event.target.value)}
          className={tall ? "min-h-72" : "min-h-20"}
        />
      ) : (
        <Input
          id={id}
          value={text}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => update(event.target.value)}
        />
      )}
    </EditorField>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  multiline = false,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
  multiline?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <EditorField label={label} htmlFor={id} hint={hint}>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-20"
        />
      ) : (
        <Input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </EditorField>
  );
}

export function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </label>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export function ItemCard({
  title,
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const t = useTranslations("siteEditor.common");
  const buttonClass =
    "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold text-foreground">{title}</p>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className={buttonClass}
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t("moveUp", { item: title })}
          >
            <ArrowUp size={14} aria-hidden />
          </button>
          <button
            type="button"
            className={buttonClass}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label={t("moveDown", { item: title })}
          >
            <ArrowDown size={14} aria-hidden />
          </button>
          <button
            type="button"
            className={cn(buttonClass, "hover:text-danger")}
            onClick={onRemove}
            aria-label={t("remove", { item: title })}
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(index, 1);
  if (moved !== undefined) {
    next.splice(target, 0, moved);
  }
  return next;
}

export function replaceItem<T>(items: T[], index: number, item: T): T[] {
  return items.map((current, position) => (position === index ? item : current));
}
