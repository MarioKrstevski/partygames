"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/button-link";
import { Button } from "@/components/ui/button";
import { shuffleArray, vibrate } from "@/lib/utils";
import { shuffleFresh } from "@/lib/freshness";
import { useSeen } from "@/lib/use-seen";

const READY_SECONDS = 3;
const ROUND_SECONDS = 5;

type Phase = "ready" | "running" | "timeup" | "finished";

type Score = { success: number; fail: number };

export default function FiveSecondsGame({
  deck,
}: {
  deck: { id: string; name: string; content: Record<string, string[]> };
}) {
  const [categories, setCategories] = useState<string[]>(() =>
    shuffleFresh(deck.content.items ?? [], deck.id),
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [secondsLeft, setSecondsLeft] = useState(READY_SECONDS);
  const [score, setScore] = useState<Score>({ success: 0, fail: 0 });
  useSeen(deck.id, categories[index]);

  // Tick down once per second while a countdown is active.
  useEffect(() => {
    if (phase !== "ready" && phase !== "running") return;
    const id = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [phase, index]);

  // Handle countdown transitions when the timer hits zero.
  useEffect(() => {
    if (secondsLeft > 0) return;
    if (phase === "ready") {
      setPhase("running");
      setSecondsLeft(ROUND_SECONDS);
      vibrate(80);
    } else if (phase === "running") {
      setPhase("timeup");
      vibrate([120, 60, 120]);
    }
  }, [secondsLeft, phase]);

  function advance() {
    if (index === categories.length - 1) {
      setPhase("finished");
      return;
    }
    setIndex((prev) => prev + 1);
    setSecondsLeft(READY_SECONDS);
    setPhase("ready");
  }

  function handleResult(kind: keyof Score) {
    setScore((prev) => ({ ...prev, [kind]: prev[kind] + 1 }));
    vibrate(40);
    advance();
  }

  function handleReplay() {
    setCategories(shuffleFresh(deck.content.items ?? [], deck.id));
    setIndex(0);
    setScore({ success: 0, fail: 0 });
    setSecondsLeft(READY_SECONDS);
    setPhase("ready");
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-xl text-zinc-300">
          This deck has no categories yet.
        </p>
        <ButtonLink href="/fiveseconds" variant="secondary">
          Back to Five Seconds
        </ButtonLink>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-white">Round over! 🎉</h1>
        <div className="flex gap-10 text-center">
          <div>
            <p className="text-5xl font-bold text-emerald-400">
              {score.success}
            </p>
            <p className="mt-1 text-sm uppercase tracking-wide text-zinc-400">
              Nailed it
            </p>
          </div>
          <div>
            <p className="text-5xl font-bold text-red-400">{score.fail}</p>
            <p className="mt-1 text-sm uppercase tracking-wide text-zinc-400">
              Too slow
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleReplay} className="h-auto px-8 py-3 text-base">
            Play again
          </Button>
          <ButtonLink href="/fiveseconds" variant="secondary">
            Exit
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] flex-col px-4 py-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-300">
            {deck.name}
          </p>
          <p className="text-xs text-zinc-500">
            Card {index + 1} of {categories.length} · ✅ {score.success} · ❌{" "}
            {score.fail}
          </p>
        </div>
        <ButtonLink href="/fiveseconds" variant="ghost" className="shrink-0">
          Exit
        </ButtonLink>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
        {phase === "ready" ? (
          <>
            <p className="text-lg uppercase tracking-widest text-zinc-400">
              Get ready…
            </p>
            <p
              key={secondsLeft}
              className="animate-pulse text-8xl font-bold tabular-nums text-violet-300"
            >
              {secondsLeft}
            </p>
          </>
        ) : (
          <>
            <p className="text-balance text-3xl font-semibold leading-snug text-white sm:text-4xl">
              {categories[index]}
            </p>
            {phase === "running" ? (
              <div
                className="relative flex h-32 w-32 items-center justify-center"
                role="timer"
                aria-label={`${secondsLeft} seconds left`}
              >
                <span
                  key={secondsLeft}
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-full bg-violet-600/30"
                />
                <span className="relative text-7xl font-bold tabular-nums text-white">
                  {secondsLeft}
                </span>
              </div>
            ) : (
              <p className="text-4xl font-bold text-red-400">Time&apos;s up! 🙉</p>
            )}
          </>
        )}
      </main>

      {phase !== "ready" && (
        <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3 pb-4">
          <Button
            onClick={() => handleResult("success")}
            className="py-4 text-base"
          >
            Nailed it ✅
          </Button>
          <Button
            onClick={() => handleResult("fail")}
            variant="destructive"
            className="py-4 text-base"
          >
            Failed ❌
          </Button>
        </div>
      )}
    </div>
  );
}
