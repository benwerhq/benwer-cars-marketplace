import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SearchFieldSegmentProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  value: string;
  isPlaceholder?: boolean;
  isActive?: boolean;
  tone?: "default" | "warning";
}

export const SearchFieldSegment = forwardRef<
  HTMLButtonElement,
  SearchFieldSegmentProps
>(function SearchFieldSegment(
  {
    icon,
    label,
    value,
    isPlaceholder = false,
    isActive = false,
    tone = "default",
    className,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 text-left transition-colors",
        "hover:bg-surface-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-surface-hover ring-2 ring-inset ring-ring",
        tone === "warning" && "bg-warning-soft hover:bg-warning-soft",
        className,
      )}
      {...props}
    >
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span
          className={cn(
            "block truncate text-sm font-medium",
            isPlaceholder ? "text-subtle-foreground" : "text-foreground",
          )}
        >
          {value}
        </span>
      </span>
    </button>
  );
});
