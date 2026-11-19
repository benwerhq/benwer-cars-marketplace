import type { ReactNode } from "react";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LocaleFlagProps {
  locale: AppLocale;
  className?: string;
}

const DEFAULT_FLAG_CLASS =
  "h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-inset ring-black/15 dark:ring-white/20";

function horizontalStripes(colors: readonly string[]): ReactNode {
  const stripeHeight = 18 / colors.length;
  return colors.map((fill, index) => (
    <rect
      key={index}
      x={0}
      y={index * stripeHeight}
      width={24}
      height={stripeHeight}
      fill={fill}
    />
  ));
}

function verticalStripes(colors: readonly string[]): ReactNode {
  const stripeWidth = 24 / colors.length;
  return colors.map((fill, index) => (
    <rect
      key={index}
      x={index * stripeWidth}
      y={0}
      width={stripeWidth}
      height={18}
      fill={fill}
    />
  ));
}

function nordicCross(bg: string, cross: string, thickness = 3.2): ReactNode {
  const y = (18 - thickness) / 2;
  return (
    <>
      <rect width={24} height={18} fill={bg} />
      <rect x={7} y={0} width={thickness} height={18} fill={cross} />
      <rect x={0} y={y} width={24} height={thickness} fill={cross} />
    </>
  );
}

const FLAG_RENDERERS: Record<AppLocale, () => ReactNode> = {
  "bg-BG": () => horizontalStripes(["#FFFFFF", "#00966E", "#D62612"]),
  "de-DE": () => horizontalStripes(["#000000", "#DD0000", "#FFCE00"]),
  "et-EE": () => horizontalStripes(["#0072CE", "#000000", "#FFFFFF"]),
  "hu-HU": () => horizontalStripes(["#CE2939", "#FFFFFF", "#477050"]),
  "lt-LT": () => horizontalStripes(["#FDB913", "#006A44", "#C1272D"]),
  "nl-NL": () => horizontalStripes(["#AE1C28", "#FFFFFF", "#21468B"]),
  "pl-PL": () => horizontalStripes(["#FFFFFF", "#DC143C"]),

  "fr-FR": () => verticalStripes(["#002395", "#FFFFFF", "#ED2939"]),
  "ga-IE": () => verticalStripes(["#169B62", "#FFFFFF", "#FF883E"]),
  "it-IT": () => verticalStripes(["#009246", "#FFFFFF", "#CE2B37"]),
  "ro-RO": () => verticalStripes(["#002B7F", "#FCD116", "#CE1126"]),

  "da-DK": () => nordicCross("#C8102E", "#FFFFFF", 3),
  "fi-FI": () => nordicCross("#FFFFFF", "#003580", 3.6),
  "sv-SE": () => nordicCross("#006AA7", "#FECC00", 3.4),

  "en-GB": () => (
    <>
      <rect width={24} height={18} fill="#012169" />
      <path d="M0 0L24 18M24 0L0 18" stroke="#FFFFFF" strokeWidth={3.6} />
      <path d="M0 0L24 18M24 0L0 18" stroke="#C8102E" strokeWidth={1.4} />
      <rect x={9.5} y={0} width={5} height={18} fill="#FFFFFF" />
      <rect x={0} y={6.5} width={24} height={5} fill="#FFFFFF" />
      <rect x={10.5} y={0} width={3} height={18} fill="#C8102E" />
      <rect x={0} y={7.5} width={24} height={3} fill="#C8102E" />
    </>
  ),

  "el-GR": () => (
    <>
      <rect width={24} height={18} fill="#FFFFFF" />
      {[0, 4, 8, 12, 16].map((y) => (
        <rect key={y} x={0} y={y} width={24} height={2} fill="#0D5EAF" />
      ))}
      <rect x={0} y={0} width={10} height={10} fill="#0D5EAF" />
      <rect x={4} y={0} width={2} height={10} fill="#FFFFFF" />
      <rect x={0} y={4} width={10} height={2} fill="#FFFFFF" />
    </>
  ),

  "cs-CZ": () => (
    <>
      {horizontalStripes(["#FFFFFF", "#D7141A"])}
      <polygon points="0,0 12,9 0,18" fill="#11457E" />
    </>
  ),

  "es-ES": () => (
    <>
      <rect x={0} y={0} width={24} height={4.5} fill="#AA151B" />
      <rect x={0} y={4.5} width={24} height={9} fill="#F1BF00" />
      <rect x={0} y={13.5} width={24} height={4.5} fill="#AA151B" />
      <rect x={5.5} y={6.8} width={3.6} height={4.4} rx={0.6} fill="#AA151B" />
      <rect x={6.3} y={7.5} width={2} height={3} rx={0.3} fill="#F1BF00" />
      <rect x={6.1} y={5.8} width={2.4} height={1} rx={0.3} fill="#AA151B" />
    </>
  ),

  "pt-PT": () => (
    <>
      <rect x={0} y={0} width={9.5} height={18} fill="#006600" />
      <rect x={9.5} y={0} width={14.5} height={18} fill="#FF0000" />
      <circle cx={9.5} cy={9} r={3.2} fill="#FFCC00" />
      <rect x={7.9} y={7.3} width={3.2} height={3.5} rx={0.9} fill="#FF0000" />
      <rect x={8.6} y={8} width={1.8} height={2.1} rx={0.4} fill="#FFFFFF" />
    </>
  ),

  "hr-HR": () => (
    <>
      {horizontalStripes(["#FF0000", "#FFFFFF", "#171796"])}
      <rect x={9.5} y={4.8} width={5} height={1.2} fill="#171796" />
      <rect x={9.6} y={6} width={4.8} height={6} rx={0.8} fill="#FFFFFF" stroke="#FF0000" strokeWidth={0.5} />
      <rect x={9.6} y={6} width={1.6} height={2} fill="#FF0000" />
      <rect x={12.8} y={6} width={1.6} height={2} fill="#FF0000" />
      <rect x={11.2} y={8} width={1.6} height={2} fill="#FF0000" />
      <rect x={9.6} y={10} width={1.6} height={2} fill="#FF0000" />
      <rect x={12.8} y={10} width={1.6} height={2} fill="#FF0000" />
    </>
  ),

  "sk-SK": () => (
    <>
      {horizontalStripes(["#FFFFFF", "#0B4EA2", "#EE1C25"])}
      <path
        d="M5.2 5.4H9.8V9.4C9.8 11.1 7.5 12.2 7.5 12.2C7.5 12.2 5.2 11.1 5.2 9.4V5.4Z"
        fill="#EE1C25"
        stroke="#FFFFFF"
        strokeWidth={0.7}
      />
      <rect x={7.1} y={6.3} width={0.8} height={4.4} fill="#FFFFFF" />
      <rect x={6.2} y={7.1} width={2.6} height={0.7} fill="#FFFFFF" />
      <rect x={5.9} y={8.5} width={3.2} height={0.7} fill="#FFFFFF" />
    </>
  ),

  "sl-SI": () => (
    <>
      {horizontalStripes(["#FFFFFF", "#005DA4", "#ED1C24"])}
      <path
        d="M4.6 3.6H8.6V6.6C8.6 7.9 6.6 8.8 6.6 8.8C6.6 8.8 4.6 7.9 4.6 6.6V3.6Z"
        fill="#005DA4"
        stroke="#ED1C24"
        strokeWidth={0.5}
      />
      <polygon points="5.1,7.3 6.1,5.7 6.6,6.3 7.1,5.4 8.1,7.3" fill="#FFFFFF" />
    </>
  ),

  "mt-MT": () => (
    <>
      {verticalStripes(["#FFFFFF", "#CF142B"])}
      <rect x={3.2} y={2} width={1.4} height={4} fill="#B8B8B8" stroke="#CF142B" strokeWidth={0.35} />
      <rect x={1.9} y={3.3} width={4} height={1.4} fill="#B8B8B8" stroke="#CF142B" strokeWidth={0.35} />
    </>
  ),

  "lv-LV": () => (
    <>
      <rect width={24} height={18} fill="#9E3039" />
      <rect x={0} y={7.2} width={24} height={3.6} fill="#FFFFFF" />
    </>
  ),
};

export function LocaleFlag({ locale, className }: LocaleFlagProps) {
  return (
    <svg
      viewBox="0 0 24 18"
      aria-hidden="true"
      className={cn(DEFAULT_FLAG_CLASS, className)}
    >
      {FLAG_RENDERERS[locale]()}
    </svg>
  );
}
