"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Points are stored 0..1 so strokes survive a resize or a retina redraw. */
interface Point {
  x: number;
  y: number;
}

interface Stroke {
  color: string;
  width: number;
  points: Point[];
}

const PAPER = "#f8f7fb";

const COLORS = [
  { name: "Ink", value: "#1c1523" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Pink", value: "#ec4899" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Green", value: "#10b981" },
  { name: "Blue", value: "#0ea5e9" },
] as const;

const WIDTHS = [
  { name: "Thin", value: 3 },
  { name: "Medium", value: 7 },
  { name: "Thick", value: 16 },
] as const;

export interface DoodleCanvasHandle {
  /** PNG data URL of the current drawing. */
  toDataURL: () => string;
  isEmpty: () => boolean;
}

interface DoodleCanvasProps {
  ref?: React.Ref<DoodleCanvasHandle>;
  onStrokeCountChange?: (count: number) => void;
}

export default function DoodleCanvas({
  ref,
  onStrokeCountChange,
}: DoodleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<Stroke | null>(null);
  const [color, setColor] = useState<string>(COLORS[0].value);
  const [width, setWidth] = useState<number>(WIDTHS[1].value);
  const [strokeCount, setStrokeCount] = useState(0);

  const publishCount = useCallback(
    (count: number) => {
      setStrokeCount(count);
      onStrokeCountChange?.(count);
    },
    [onStrokeCountChange],
  );

  /** Repaint everything — used after undo, clear and resize. */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { width: w, height: h } = canvas.getBoundingClientRect();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dpr = canvas.width / w;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokesRef.current) {
      if (stroke.points.length === 0) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
      if (stroke.points.length === 1) {
        // A single tap should still leave a dot.
        ctx.lineTo(stroke.points[0].x * w + 0.01, stroke.points[0].y * h);
      } else {
        for (const point of stroke.points.slice(1)) {
          ctx.lineTo(point.x * w, point.y * h);
        }
      }
      ctx.stroke();
    }
  }, []);

  // Size the backing store to the element and the device pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      redraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [redraw]);

  useImperativeHandle(
    ref,
    () => ({
      toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
      isEmpty: () => strokesRef.current.length === 0,
    }),
    [],
  );

  function pointFrom(event: ReactPointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  }

  function startStroke(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke: Stroke = { color, width, points: [pointFrom(event)] };
    drawingRef.current = stroke;
    strokesRef.current = [...strokesRef.current, stroke];
    publishCount(strokesRef.current.length);
    redraw();
  }

  function extendStroke(event: ReactPointerEvent<HTMLCanvasElement>) {
    const stroke = drawingRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stroke || !canvas || !ctx) return;

    const previous = stroke.points[stroke.points.length - 1];
    const next = pointFrom(event);
    stroke.points.push(next);

    // Draw just the new segment — a full redraw per move is wasteful.
    const { width: w, height: h } = canvas.getBoundingClientRect();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(previous.x * w, previous.y * h);
    ctx.lineTo(next.x * w, next.y * h);
    ctx.stroke();
  }

  function endStroke() {
    drawingRef.current = null;
  }

  function undo() {
    strokesRef.current = strokesRef.current.slice(0, -1);
    publishCount(strokesRef.current.length);
    redraw();
  }

  function clear() {
    strokesRef.current = [];
    publishCount(0);
    redraw();
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        aria-label="Drawing area"
        onPointerDown={startStroke}
        onPointerMove={(e) => drawingRef.current && extendStroke(e)}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={endStroke}
        className="aspect-[4/3] w-full touch-none rounded-2xl border border-white/15 bg-[#f8f7fb] shadow-lg shadow-black/30"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5" role="group" aria-label="Colour">
          {COLORS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={option.name}
              aria-pressed={color === option.value}
              onClick={() => setColor(option.value)}
              style={{ backgroundColor: option.value }}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform",
                color === option.value
                  ? "scale-110 border-white"
                  : "border-white/20 hover:border-white/50",
              )}
            />
          ))}
        </div>

        <div className="flex gap-1.5" role="group" aria-label="Brush size">
          {WIDTHS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={option.name}
              aria-pressed={width === option.value}
              onClick={() => setWidth(option.value)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                width === option.value
                  ? "border-violet-400 bg-violet-600/30"
                  : "border-white/15 bg-white/5 hover:bg-white/10",
              )}
            >
              <span
                aria-hidden
                className="block rounded-full bg-white"
                style={{
                  width: Math.min(option.value, 14),
                  height: Math.min(option.value, 14),
                }}
              />
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={strokeCount === 0}
          >
            ↩ Undo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={strokeCount === 0}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
