"use client";

import type { ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface IconTooltipProps {
  label: string;
  children: ReactNode;
}

export function IconTooltip({ label, children }: IconTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={6}
            className="z-[70] rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-md"
          >
            {label}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
