"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout";
import { vibrate } from "@/lib/utils";
import { shuffleFresh } from "@/lib/freshness";
import { useSeen } from "@/lib/use-seen";
import {
  depthGradient,
  depthHue,
  depthLabel,
  intensityOf,
  parseThreads,
  type Thread,
} from "@/lib/deeper";

type DeeperGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

const threadKey = (t: Thread) => t.rungs[0];

export default function DeeperGame({ deck }: DeeperGameProps) {
  const allThreads = parseThreads(deck.content.threads ?? []);
  // Unshuffled for the server render; shuffling during SSR breaks hydration
  // because the server and the client would pick different first questions.
  const [threads, setThreads] = useState<Thread[]>(allThreads);
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState(0);
  const [bailed, setBailed] = useState(false);
  const [deepest, setDeepest] = useState(0);

  useEffect(() => {
    setThreads(shuffleFresh(allThreads, deck.id, threadKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shuffle once on mount
  }, [deck.id]);

  const thread = threads[index];
  useSeen(deck.id, thread ? threadKey(thread) : null);

  const total = thread?.rungs.length ?? 0;
  const atBottom = level >= total - 1;

  function goDeeper() {
    if (atBottom) return;
    vibrate(40 + level * 20);
    const next = level + 1;
    setLevel(next);
    setDeepest((d) => Math.max(d, next));
  }

  function newThread(didBail: boolean) {
    vibrate(30);
    setBailed(didBail);
    setLevel(0);
    setIndex((i) => {
      if (i + 1 < threads.length) return i + 1;
      setThreads(shuffleFresh(allThreads, deck.id, threadKey));
      return 0;
    });
  }

  if (allThreads.length === 0 || !thread) {
    return (
      <PageContainer className="flex min-h-[70dvh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <p className="text-zinc-400">
          This deck has no playable threads — each line needs a{" "}
          <code>&gt;</code> so the question has somewhere to go.
        </p>
        <Button asChild variant="secondary">
          <Link href="/deeper">Back to decks</Link>
        </Button>
      </PageContainer>
    );
  }

  const heat = intensityOf(level, total);

  return (
    <div
      className="flex min-h-[calc(100dvh-3.5rem)] flex-col transition-[background] duration-700"
      style={{ background: depthGradient(level, total) }}
    >
      <PageContainer className="flex flex-1 flex-col">
        <div className="mb-6 flex items-center justify-between text-sm text-white/60">
          <span className="truncate font-medium">{deck.name}</span>
          <Link href="/deeper" className="transition-colors hover:text-white">
            Exit
          </Link>
        </div>

        {/* Depth gauge — the rungs you have climbed down, filled in. */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex flex-1 gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  i <= level ? "bg-white/90" : "bg-white/15"
                }`}
              />
            ))}
          </div>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-white/70">
            {depthLabel(level, total)}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {bailed && level === 0 && (
            <p className="mb-6 text-sm text-white/60" aria-live="polite">
              🐔 Somebody bailed. New thread.
            </p>
          )}
          <p
            key={`${index}-${level}`}
            className="text-3xl font-bold leading-snug text-white sm:text-4xl"
            aria-live="polite"
          >
            {thread.rungs[level]}
          </p>
          {atBottom && (
            <p className="mt-6 text-sm font-medium text-white/70">
              That is the bottom of this one.
            </p>
          )}
        </div>

        <div className="space-y-2 pb-2">
          {atBottom ? (
            <Button
              className="h-auto w-full py-5 text-lg"
              onClick={() => newThread(false)}
            >
              New thread →
            </Button>
          ) : (
            <>
              <Button
                className="h-auto w-full py-6 text-xl"
                onClick={goDeeper}
                style={{
                  // The button gets more insistent the further down you are.
                  boxShadow: `0 0 ${20 + heat * 40}px hsl(${depthHue(
                    level,
                    total,
                  )} 90% 60% / ${0.25 + heat * 0.45})`,
                }}
              >
                🕳️ Deeper
              </Button>
              <Button
                variant="ghost"
                className="w-full text-white/70 hover:text-white"
                onClick={() => newThread(true)}
              >
                {level === 0 ? "Skip this one" : "Too far — bail out"}
              </Button>
            </>
          )}
          {deepest > 0 && (
            <p className="pt-1 text-center text-xs text-white/40">
              Deepest anyone has gone tonight: level {deepest + 1}
            </p>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
