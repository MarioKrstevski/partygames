"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, shuffleArray, vibrate } from "@/lib/utils";

type Kind = "truth" | "dare";

type Prompt = { kind: Kind; text: string };

export default function TruthOrDareGame({
  deck,
}: {
  deck: { id: string; name: string; content: Record<string, string[]> };
}) {
  const [truths, setTruths] = useState(() =>
    shuffleArray(deck.content.truths ?? []),
  );
  const [dares, setDares] = useState(() =>
    shuffleArray(deck.content.dares ?? []),
  );
  const [truthIndex, setTruthIndex] = useState(0);
  const [dareIndex, setDareIndex] = useState(0);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [round, setRound] = useState(1);

  function draw(kind: Kind) {
    const pile = kind === "truth" ? truths : dares;
    const index = kind === "truth" ? truthIndex : dareIndex;
    if (pile.length === 0) return;

    setPrompt({ kind, text: pile[index] });
    vibrate(50);

    const exhausted = index + 1 >= pile.length;
    if (kind === "truth") {
      if (exhausted) {
        setTruths(shuffleArray(truths));
        setTruthIndex(0);
      } else {
        setTruthIndex(index + 1);
      }
    } else {
      if (exhausted) {
        setDares(shuffleArray(dares));
        setDareIndex(0);
      } else {
        setDareIndex(index + 1);
      }
    }
  }

  function handleNextPlayer() {
    setPrompt(null);
    setRound((prev) => prev + 1);
    vibrate(30);
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-4 py-4">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-300">
            {deck.name}
          </p>
          <p className="text-xs text-zinc-500">Round {round}</p>
        </div>
        <Link
          href="/truthordare"
          className="rounded-xl px-3 py-1.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
        >
          Exit
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        {prompt ? (
          <>
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-[0.3em]",
                prompt.kind === "truth" ? "text-violet-400" : "text-pink-400",
              )}
            >
              {prompt.kind}
            </p>
            <p className="mt-4 max-w-xl text-balance text-3xl font-semibold leading-snug sm:text-4xl">
              {prompt.text}
            </p>
          </>
        ) : (
          <p className="text-2xl font-semibold text-zinc-300">
            Truth or Dare?
          </p>
        )}
      </main>

      <footer className="pb-4">
        {prompt ? (
          <Button
            onClick={handleNextPlayer}
            className="w-full py-5 text-lg"
          >
            Next Player
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => draw("truth")}
              disabled={truths.length === 0}
              className="py-8 text-xl"
            >
              Truth
            </Button>
            <Button
              onClick={() => draw("dare")}
              disabled={dares.length === 0}
              className="bg-pink-600 py-8 text-xl shadow-pink-600/25 hover:bg-pink-500 active:bg-pink-700"
            >
              Dare
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
}
