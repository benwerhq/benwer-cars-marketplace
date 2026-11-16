import qrcode from "qrcode-generator";
import { cn } from "@/lib/utils";

interface QrCodeProps {
  value: string;
  label: string;
  className?: string;
}

export function QrCode({ value, label, className }: QrCodeProps) {
  const code = qrcode(0, "M");
  code.addData(value);
  code.make();
  const count = code.getModuleCount();
  const cells: string[] = [];

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (code.isDark(row, col)) {
        cells.push(`M${col} ${row}h1v1h-1z`);
      }
    }
  }

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`-2 -2 ${count + 4} ${count + 4}`}
      shapeRendering="crispEdges"
      className={cn("bg-surface text-foreground", className)}
    >
      <path d={cells.join("")} className="fill-current" />
    </svg>
  );
}
