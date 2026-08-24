"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { shuffleArray, vibrate } from "@/lib/utils";

type NeverHaveIEverGameProps = {
  deck: { id: string; name: string; content: Record<string, string[]> };
};

export default function NeverHaveIEverGame({
  deck,
}: NeverHaveIEverGameProps) {
  const [statements, setStatements] = useState<string[]>(
    deck.content.items ?? [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Shuffle on the client only — shuffling during SSR breaks hydration.
  useEffect(() => {
    setStatements((current) => shuffleArray(current));
  }, []);

  function handleNext() {
    vibrate(50);
    if (currentIndex === statements.length - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  }

  function handleReplay() {
    vibrate(50);
    setStatements(shuffleArray(statements));
    setCurrentIndex(0);
    setIsFinished(false);
  }

  if (statements.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xl text-zinc-300">
          This deck doesn&apos;t have any statements yet.
        </p>
        <Link
          href="/neverhaveiever"
          className="text-sm font-semibold text-violet-300 hover:text-violet-200"
        >
          Back to Never Have I Ever
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 text-center">
        <span aria-hidden className="text-6xl">
          🎉
        </span>
        <div>
          <h2 className="text-3xl font-bold text-white">That&apos;s a wrap!</h2>
          <p className="mt-2 text-zinc-400">
            You went through all {statements.length} statements in &ldquo;
            {deck.name}&rdquo;.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button onClick={handleReplay} className="px-8 py-3 text-base">
            Play again
          </Button>
          <Link
            href="/neverhaveiever"
            className="text-sm font-semibold text-zinc-300 hover:text-white"
          >
            Exit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col px-6 py-6">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          {currentIndex + 1} / {statements.length}
        </span>
        <Link
          href="/neverhaveiever"
          className="font-semibold text-zinc-300 hover:text-white"
        >
          Exit
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
          Never have I ever…
        </p>
        <p className="mt-6 max-w-xl text-3xl font-bold leading-snug text-white sm:text-4xl">
          {statements[currentIndex]}
        </p>
      </div>

      <div className="pb-8 text-center">
        <Button onClick={handleNext} className="w-full max-w-sm py-4 text-lg">
          {currentIndex === statements.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
