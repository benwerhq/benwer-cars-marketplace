"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

const OUT_WIDTH = 1024;
const OUT_HEIGHT = 512;
const VIEW_WIDTH = 440;
const VIEW_HEIGHT = 220;

interface LogoCropDialogProps {
  file: File | null;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
}

export function LogoCropDialog({ file, onCancel, onConfirm }: LogoCropDialogProps) {
  const t = useTranslations("siteEditor.branding");
  const [loaded, setLoaded] = useState<{ file: File; element: HTMLImageElement } | null>(null);
  const image = loaded?.file === file ? loaded.element : null;
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setLoaded({ file, element: img });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !image) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, OUT_WIDTH, OUT_HEIGHT);
    const baseScale = Math.min(OUT_WIDTH / image.width, OUT_HEIGHT / image.height);
    const scale = baseScale * zoom;
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    const ratio = OUT_WIDTH / VIEW_WIDTH;
    const x = (OUT_WIDTH - drawW) / 2 + offset.x * ratio;
    const y = (OUT_HEIGHT - drawH) / 2 + offset.y * ratio;
    ctx.drawImage(image, x, y, drawW, drawH);
  }, [image, zoom, offset]);

  if (!file) {
    return null;
  }

  function handleConfirm() {
    const canvas = previewRef.current;
    if (!canvas || !file) {
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const baseName = file.name.replace(/\.[^.]+$/, "") || "logo";
      onConfirm(new File([blob], `${baseName}-2x1.png`, { type: "image/png" }));
    }, "image/png");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("cropTitle")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <h3 className="text-base font-semibold text-foreground">{t("cropTitle")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t("cropHint")}</p>

        <div
          className="relative mx-auto mt-4 flex items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-muted select-none"
          style={{ width: VIEW_WIDTH, height: VIEW_HEIGHT, maxWidth: "100%", touchAction: "none" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
          }}
          onPointerMove={(e) => {
            if (!dragging || !dragStart.current) {
              return;
            }
            setOffset({
              x: dragStart.current.ox + (e.clientX - dragStart.current.x),
              y: dragStart.current.oy + (e.clientY - dragStart.current.y),
            });
          }}
          onPointerUp={() => {
            setDragging(false);
            dragStart.current = null;
          }}
        >
          <canvas
            ref={previewRef}
            width={OUT_WIDTH}
            height={OUT_HEIGHT}
            className="h-full w-full cursor-grab active:cursor-grabbing"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomOut size={16} className="shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.05}
            value={zoom}
            aria-label={t("cropZoom")}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <ZoomIn size={16} className="shrink-0 text-muted-foreground" aria-hidden />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t("cropCancel")}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleConfirm}>
            {t("cropSave")}
          </Button>
        </div>
      </div>
    </div>
  );
}
