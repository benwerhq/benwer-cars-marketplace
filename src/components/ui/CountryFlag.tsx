import * as FlagIcons from "country-flag-icons/react/3x2";
import type { SVGProps } from "react";

type FlagComponent = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

const flags = FlagIcons as unknown as Record<string, FlagComponent>;

export function CountryFlag({
  country,
  name,
}: {
  country: string;
  name: string;
}) {
  const Flag = flags[country];
  if (!Flag) {
    return (
      <span
        role="img"
        aria-label={name}
        className="inline-block h-3 w-4 shrink-0 rounded-sm bg-surface-muted"
      />
    );
  }

  return (
    <Flag
      role="img"
      aria-label={name}
      className="h-3 w-4 shrink-0 rounded-sm"
    />
  );
}
