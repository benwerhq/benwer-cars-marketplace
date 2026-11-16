"use client";

import type { SiteCornerStyle } from "@/enums";
import type { LogoPair } from "@/types/company";
import { useDocumentCorners } from "@/hooks/useDocumentCorners";
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";

interface SiteDraftLogo {
  headerLogo: LogoPair | undefined;
  setHeaderLogo: (logo: LogoPair | undefined) => void;
  setThemeStyle: (style: CSSProperties | undefined) => void;
  setCornerStyle: (style: SiteCornerStyle | undefined) => void;
}

const SiteDraftLogoContext = createContext<SiteDraftLogo | null>(null);

export function SiteDraftLogoProvider({ children }: { children: ReactNode }) {
  const [headerLogo, setHeaderLogo] = useState<LogoPair | undefined>(undefined);
  const [themeStyle, setThemeStyle] = useState<CSSProperties | undefined>(undefined);
  const [cornerStyle, setCornerStyle] = useState<SiteCornerStyle | undefined>(undefined);
  useDocumentCorners(cornerStyle);
  return (
    <SiteDraftLogoContext.Provider value={{ headerLogo, setHeaderLogo, setThemeStyle, setCornerStyle }}>
      <div
        style={themeStyle}
        data-corners={cornerStyle}
        data-brand={themeStyle && "--site-primary" in themeStyle ? "" : undefined}
        className="contents"
      >
        {children}
      </div>
    </SiteDraftLogoContext.Provider>
  );
}

export function useSiteDraftLogo(): SiteDraftLogo | null {
  return useContext(SiteDraftLogoContext);
}
