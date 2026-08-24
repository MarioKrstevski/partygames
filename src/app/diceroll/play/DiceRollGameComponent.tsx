"use client";

import { useEffect, useRef, useState } from "react";
import Dice from "./Dice";
import { Button } from "@/components/ui";
import { cn, randomNumber } from "@/lib/utils";
import "./diceroll.css";

const DICE_COUNTS = [1, 2, 3] as const;
/** How long the intermediate face is shown so the cube always animates. */
const NUDGE_MS = 300;
/** Cube transition duration (see diceroll.css) plus the nudge. */
const ROLL_MS = 1000 + NUDGE_MS;

/** Opposite faces of a die sum to 7, so this is always a different face. */
function oppositeFace(value: number): number {
  return 7 - value;
}

export default function DiceRollGameComponent() {
  const [values, setValues] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => timeouts.forEach((id) => window.clearTimeout(id));
  }, []);

  function setDiceCount(count: number) {
    setValues((current) =>
      Array.from({ length: count }, (_, index) => current[index] ?? 1),
    );
  }

  function rollDice() {
    if (isRolling) return;
    setIsRolling(true);
    const results = values.map(() => randomNumber(1, 6));
    // Show the opposite face first so the cube visibly spins even when a
    // die lands on the same value it already shows.
    setValues(results.map(oppositeFace));
    timeoutsRef.current.push(
      window.setTimeout(() => setValues(results), NUDGE_MS),
      window.setTimeout(() => setIsRolling(false), ROLL_MS),
    );
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex h-full flex-col items-center justify-between gap-8 py-10">
      <fieldset>
        <legend className="mb-3 text-center text-lg font-semibold">
          How many dice?
        </legend>
        <div className="flex items-center justify-center gap-2">
          {DICE_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setDiceCount(count)}
              aria-pressed={values.length === count}
              disabled={isRolling}
              className={cn(
                "h-10 w-10 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-50",
                values.length === count
                  ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                  : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10",
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-center gap-6">
        {values.map((value, index) => (
          <Dice key={index} value={value} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <p
          aria-live="polite"
          className={cn(
            "text-lg font-semibold text-zinc-200",
            values.length < 2 && "invisible",
          )}
        >
          Total: {isRolling ? "…" : total}
        </p>
        <Button onClick={rollDice} disabled={isRolling} className="w-40">
          {isRolling ? "Rolling…" : "Roll dice"}
        </Button>
      </div>
    </div>
  );
}
