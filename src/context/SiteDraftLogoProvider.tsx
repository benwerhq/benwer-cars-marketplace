"use client";

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";

interface SiteDraftLogo {
  headerLogo: string | null | undefined;
  setHeaderLogo: (url: string | null | undefined) => void;
  setThemeStyle: (style: CSSProperties | undefined) => void;
}

const SiteDraftLogoContext = createContext<SiteDraftLogo | null>(null);

export function SiteDraftLogoProvider({ children }: { children: ReactNode }) {
  const [headerLogo, setHeaderLogo] = useState<string | null | undefined>(undefined);
  const [themeStyle, setThemeStyle] = useState<CSSProperties | undefined>(undefined);
  return (
    <SiteDraftLogoContext.Provider value={{ headerLogo, setHeaderLogo, setThemeStyle }}>
      <div style={themeStyle} className="contents">
        {children}
      </div>
    </SiteDraftLogoContext.Provider>
  );
}

export function useSiteDraftLogo(): SiteDraftLogo | null {
  return useContext(SiteDraftLogoContext);
}
