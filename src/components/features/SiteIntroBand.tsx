import type { ReactNode } from "react";

interface SiteIntroBandProps {
  mark: ReactNode;
  title: string;
  eyebrow?: string | null;
  intro?: string | null;
  children?: ReactNode;
}

export function SiteIntroBand({
  mark,
  title,
  eyebrow,
  intro,
  children,
}: SiteIntroBandProps) {
  return (
    <section className="relative w-full overflow-hidden border-y border-border bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col items-start gap-4">
          {mark}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-sm font-medium text-primary">{eyebrow}</p>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {intro ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {intro}
              </p>
            ) : null}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export function SiteIntroFacts({ children }: { children: ReactNode }) {
  return (
    <ul className="flex flex-col gap-2 text-sm text-foreground sm:flex-row sm:flex-wrap sm:gap-6">
      {children}
    </ul>
  );
}
