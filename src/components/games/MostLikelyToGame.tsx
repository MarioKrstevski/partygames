"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { shuffleArray, vibrate } from "@/lib/utils";

type MostLikelyToGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function MostLikelyToGame({ deck }: MostLikelyToGameProps) {
  const [prompts, setPrompts] = useState<string[]>(deck.content.items ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  // Shuffle on the client only — shuffling during SSR breaks hydration.
  useEffect(() => {
    setPrompts((current) => shuffleArray(current));
  }, []);

  const total = prompts.length;

  function handleNext() {
    vibrate(50);
    if (currentIndex === total - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleReplay() {
    vibrate(50);
    setPrompts(shuffleArray(prompts));
    setCurrentIndex(0);
    setFinished(false);
  }

  if (total === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xl text-zinc-300">This deck has no prompts yet.</p>
        <Link
          href="/mostlikelyto"
          className="text-sm font-medium text-violet-300 hover:text-violet-200"
        >
          Back to Most Likely To
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col px-4 py-4">
      <header className="flex items-center justify-between">
        <Link
          href="/mostlikelyto"
          className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          Exit
        </Link>
        <p className="truncate px-2 text-sm text-zinc-400">{deck.name}</p>
        <p className="text-sm tabular-nums text-zinc-400" aria-live="polite">
          {finished ? total : currentIndex + 1}/{total}
        </p>
      </header>

      {finished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <p className="text-4xl" aria-hidden="true">
            🎉
          </p>
          <h2 className="text-3xl font-bold text-white">That&apos;s a wrap!</h2>
          <p className="text-zinc-300">
            You went through all {total} prompts.
          </p>
          <Button
            onClick={handleReplay}
            className="w-full max-w-xs py-4 text-lg"
          >
            Play again
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center shadow-lg shadow-violet-600/10 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">
                Who is most likely to…
              </p>
              <p className="mt-6 text-3xl font-bold leading-snug text-white sm:text-4xl">
                {prompts[currentIndex]}
              </p>
            </div>
          </div>
          <div className="pb-4">
            <Button
              onClick={handleNext}
              className="w-full py-5 text-xl"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
