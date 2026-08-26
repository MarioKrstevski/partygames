"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout";
import { vibrate } from "@/lib/utils";
import { shuffleFresh } from "@/lib/freshness";
import { useSeen } from "@/lib/use-seen";
import { pickSide, pickTwist, type Side, type Twist } from "@/lib/flipside";

type Phase = "statement" | "counting" | "twist";

type FlipSideGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function FlipSideGame({ deck }: FlipSideGameProps) {
  const allStatements = deck.content.statements ?? [];
  // Unshuffled for the server render; shuffling during SSR breaks hydration
  // because the server and the client would pick different first statements.
  const [statements, setStatements] = useState<string[]>(allStatements);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("statement");
  const [count, setCount] = useState(3);
  const [side, setSide] = useState<Side>("agree");
  const [twist, setTwist] = useState<Twist | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    setStatements(shuffleFresh(allStatements, deck.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shuffle once on mount
  }, [deck.id]);

  const statement = statements[index];
  useSeen(deck.id, statement);

  // 3 — 2 — 1 — shout. Nobody gets to hear anyone else first.
  useEffect(() => {
    if (phase !== "counting") return;
    if (count === 0) {
      setSide(pickSide());
      const chosen = pickTwist();
      setTwist(chosen);
      setSecondsLeft(chosen.seconds);
      setPhase("twist");
      vibrate([90, 60, 90]);
      return;
    }
    const id = window.setTimeout(() => {
      setCount((c) => c - 1);
      vibrate(40);
    }, 900);
    return () => window.clearTimeout(id);
  }, [phase, count]);

  // The argument clock. Running out is a nudge, not a buzzer.
  useEffect(() => {
    if (phase !== "twist" || secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, secondsLeft]);

  function startCount() {
    setCount(3);
    setPhase("counting");
  }

  function next() {
    setPhase("statement");
    setTwist(null);
    setIndex((i) => {
      if (i + 1 < statements.length) return i + 1;
      setStatements(shuffleFresh(allStatements, deck.id));
      return 0;
    });
  }

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/flipside" className="transition-colors hover:text-white">
        Exit
      </Link>
    </div>
  );

  if (allStatements.length === 0 || !statement) {
    return (
      <PageContainer className="flex min-h-[70dvh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <p className="text-zinc-400">This deck has no statements yet.</p>
        <Button asChild variant="secondary">
          <Link href="/flipside">Back to decks</Link>
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex min-h-[calc(100dvh-3.5rem)] max-w-xl flex-col">
      {header}

      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="rounded-3xl border border-violet-400/30 bg-gradient-to-b from-violet-600/25 to-pink-500/10 p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            Agree or disagree?
          </p>
          <p className="mt-4 text-3xl font-bold leading-snug sm:text-4xl">
            {statement}
          </p>
        </div>

        {phase === "counting" && (
          <div aria-live="assertive" className="space-y-2">
            <p className="text-8xl font-extrabold tabular-nums text-white">
              {count === 0 ? "!" : count}
            </p>
            <p className="text-sm text-zinc-400">
              Everyone shouts at the same time — no peeking at each other
            </p>
          </div>
        )}

        {phase === "twist" && twist && (
          <div
            aria-live="polite"
            className="w-full space-y-4 rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-amber-500/5 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              😈 Flip side
            </p>
            <p className="text-2xl font-bold leading-snug">
              {twist.text(side)}
            </p>
            <p
              className={`text-5xl font-bold tabular-nums ${
                secondsLeft === 0 ? "text-red-400" : "text-amber-200"
              }`}
            >
              {secondsLeft === 0 ? "time" : `${secondsLeft}s`}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 pb-2">
        {phase === "statement" && (
          <Button className="h-auto w-full py-6 text-xl" onClick={startCount}>
            Count us down
          </Button>
        )}
        {phase === "counting" && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setCount(0)}
          >
            Skip the countdown
          </Button>
        )}
        {phase === "twist" && (
          <Button className="h-auto w-full py-5 text-lg" onClick={next}>
            Next statement →
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
