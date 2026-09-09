"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./fingerpicker.css";

/**
 * Finger Picker: a full-screen surface where everyone puts a finger down.
 * Each touch is a glowing dot. Once the group has settled for a moment the
 * screen picks one finger (or deals the fingers into two teams). Lifting every
 * finger resets it.
 *
 * Every touch is tracked by its pointerId, so it works with as many fingers as
 * the device reports at once (five on iPhones, ten on most Android phones).
 */

interface Finger {
  id: number;
  x: number;
  y: number;
  hue: number;
  team?: 0 | 1;
}

type Mode = "one" | "teams";
type Phase = "idle" | "settling" | "picked";

/** How long the group has to hold still before the pick happens. */
const SETTLE_MS = 2500;
const HUES = [285, 330, 200, 150, 40, 15, 250, 90, 310, 175];

function randomIndex(n: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

export default function FingerPicker() {
  const [fingers, setFingers] = useState<Map<number, Finger>>(() => new Map());
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<Mode>("one");
  const [winner, setWinner] = useState<number | null>(null);
  const [settleKey, setSettleKey] = useState(0);
  const timer = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  /** Restart the settle countdown whenever the set of fingers changes. */
  const arm = useCallback(
    (count: number) => {
      clearTimer();
      if (count < 2) {
        setPhase("idle");
        return;
      }
      setPhase("settling");
      setSettleKey((k) => k + 1);
      timer.current = window.setTimeout(() => {
        setFingers((prev) => {
          const ids = [...prev.keys()];
          if (ids.length < 2) return prev;
          const next = new Map(prev);
          if (mode === "one") {
            setWinner(ids[randomIndex(ids.length)]);
          } else {
            // Shuffle, then deal alternately so the teams differ by at most one.
            const order = [...ids];
            for (let i = order.length - 1; i > 0; i--) {
              const j = randomIndex(i + 1);
              [order[i], order[j]] = [order[j], order[i]];
            }
            order.forEach((id, i) => {
              const f = next.get(id);
              if (f) next.set(id, { ...f, team: (i % 2) as 0 | 1 });
            });
            setWinner(null);
          }
          return next;
        });
        setPhase("picked");
        if ("vibrate" in navigator) navigator.vibrate([40, 60, 120]);
      }, SETTLE_MS);
    },
    [mode],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phaseRef.current === "picked") return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFingers((prev) => {
      const next = new Map(prev);
      const hue = HUES[next.size % HUES.length];
      next.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY, hue });
      arm(next.size);
      return next;
    });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setFingers((prev) => {
      const f = prev.get(e.pointerId);
      if (!f) return prev;
      const next = new Map(prev);
      next.set(e.pointerId, { ...f, x: e.clientX, y: e.clientY });
      return next;
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setFingers((prev) => {
      if (!prev.has(e.pointerId)) return prev;
      const next = new Map(prev);
      next.delete(e.pointerId);
      if (phaseRef.current === "picked") {
        // Hold the result until every finger has lifted, then start over.
        if (next.size === 0) {
          setWinner(null);
          setPhase("idle");
        }
        return next;
      }
      arm(next.size);
      return next;
    });
  };

  useEffect(() => clearTimer, []);

  const count = fingers.size;
  const hint =
    phase === "picked"
      ? "Lift your fingers to go again"
      : count === 0
        ? "Everyone, put a finger on the screen"
        : count === 1
          ? "One more finger at least"
          : "Hold still…";

  return (
    <div
      className="fp fixed inset-0 z-[60] select-none overflow-hidden bg-[oklch(0.12_0.03_300)] text-white"
      data-phase={phase}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Chrome: exit and the mode switch. Stops pointer events so a tap here is not a finger. */}
      <div
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Link href="/" className="rounded-lg px-2 py-1 text-sm text-zinc-400 transition-colors hover:text-white">
          Exit
        </Link>
        <div className="flex rounded-full border border-white/15 p-0.5 text-xs font-semibold">
          {(["one", "teams"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                if (phaseRef.current === "settling") arm(fingers.size);
              }}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                mode === m ? "bg-white text-black" : "text-zinc-300"
              }`}
            >
              {m === "one" ? "Pick one" : "Two teams"}
            </button>
          ))}
        </div>
      </div>

      {[...fingers.values()].map((f) => {
        const isWinner = winner === f.id;
        const lost = phase === "picked" && mode === "one" && !isWinner;
        const hue = phase === "picked" && mode === "teams" ? (f.team === 0 ? 285 : 40) : f.hue;
        return (
          <div
            key={f.id}
            className={`fp-dot ${isWinner ? "fp-win" : ""} ${lost ? "fp-lost" : ""}`}
            style={{ left: f.x, top: f.y, ["--hue" as string]: hue }}
          >
            {phase === "settling" && <span key={settleKey} className="fp-ring" />}
          </div>
        );
      })}

      <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-sm font-medium text-zinc-400">
        {hint}
      </p>
    </div>
  );
}
