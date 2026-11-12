"use client";

import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { Card } from "@/components/ui";

const TOTAL_FRAMES = 11;
const FRAMES = Array.from({ length: TOTAL_FRAMES }, (_, index) => `/models/${index + 1}.jpg`);
const DRAG_THRESHOLD_PX = 20;

export default function Viewer360({ model }: { model: string }) {
  const [frame, setFrame] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const lastFrame = useRef(0);

  const goTo = useCallback((index: number) => {
    const wrapped = ((index % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES;
    setFrame(wrapped);
    lastFrame.current = wrapped;
  }, []);

  const handleMove = (clientX: number) => {
    const diff = clientX - startX.current;
    if (Math.abs(diff) > DRAG_THRESHOLD_PX) {
      goTo(lastFrame.current + (diff > 0 ? -1 : 1));
      startX.current = clientX;
    }
  };

  const arrowClasses =
    "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-white/90 text-fg shadow-card outline-none hover:bg-white focus-visible:ring-3 focus-visible:ring-primary/30";

  return (
    <Card
      title={`Conheça seu ${model}`}
      subtitle="Clique e arraste, ou use as setas do teclado, para girar o veículo."
      action={
        <span className="hidden items-center gap-1.5 text-sm text-fg-muted tablet:flex">
          <RotateCw aria-hidden size={16} /> 360°
        </span>
      }
    >
      <div className="relative">
        <button type="button" aria-label="Girar para a esquerda" onClick={() => goTo(frame - 1)} className={`${arrowClasses} left-2`}>
          <ChevronLeft aria-hidden size={20} />
        </button>
        <div
          role="img"
          tabIndex={0}
          aria-label={`Visualização 360 graus, ângulo ${frame + 1} de ${TOTAL_FRAMES}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") goTo(frame - 1);
            if (event.key === "ArrowRight") goTo(frame + 1);
          }}
          onMouseDown={(event) => {
            dragging.current = true;
            startX.current = event.clientX;
          }}
          onMouseMove={(event) => dragging.current && handleMove(event.clientX)}
          onMouseUp={() => (dragging.current = false)}
          onMouseLeave={() => (dragging.current = false)}
          onTouchStart={(event) => (startX.current = event.touches[0].clientX)}
          onTouchMove={(event) => handleMove(event.touches[0].clientX)}
          className="relative aspect-video w-full cursor-grab overflow-hidden rounded-xl bg-white outline-none select-none focus-visible:ring-3 focus-visible:ring-primary/30 active:cursor-grabbing"
        >
          {FRAMES.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="(min-width: 960px) 800px, 100vw"
              draggable={false}
              className={`pointer-events-none object-contain ${index === frame ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
        <button type="button" aria-label="Girar para a direita" onClick={() => goTo(frame + 1)} className={`${arrowClasses} right-2`}>
          <ChevronRight aria-hidden size={20} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-fg-muted">
        Ângulo {frame + 1} de {TOTAL_FRAMES}
      </p>
    </Card>
  );
}
