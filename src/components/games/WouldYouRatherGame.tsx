"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlayers } from "@/components/players/usePlayers";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout";
import { cn, shuffleArray, vibrate } from "@/lib/utils";
import { parseDilemmas, type Dilemma } from "@/lib/dilemmas";

const FLAVOR_LINES = [
  "Bold choice!",
  "No hesitation. Respect.",
  "The group demands an explanation.",
  "Someone's sleeping easy tonight.",
  "Spicy. Very spicy.",
  "That answer says a lot about you.",
  "Zero regrets, apparently.",
  "Interesting… very interesting.",
  "The debate starts now.",
  "Living dangerously, we see.",
];

type Phase = "start" | "playing" | "done";

type WouldYouRatherGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function WouldYouRatherGame({ deck }: WouldYouRatherGameProps) {
  const { roster, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("start");
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [turn, setTurn] = useState(0);

  const allDilemmas = parseDilemmas(deck.content.dilemmas ?? []);
  const players = ready ? roster.players : [];
  const chooser = players.length >= 2 ? players[turn % players.length] : null;

  function startGame() {
    setDilemmas(shuffleArray(allDilemmas));
    setIndex(0);
    setPicked(null);
    setTurn(0);
    setPhase("playing");
  }

  // Rotates with the card index — varied without random state.
  const flavor = FLAVOR_LINES[(index * 3 + (picked === "b" ? 1 : 0)) % FLAVOR_LINES.length];

  function choose(side: "a" | "b") {
    if (picked) return;
    vibrate(30);
    setPicked(side);
  }

  function next() {
    if (index + 1 >= dilemmas.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setTurn((t) => t + 1);
    setPicked(null);
  }

  const dilemma = dilemmas[index];

  if (allDilemmas.length === 0) {
    return (
      <PageContainer className="flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 text-center">
        <p className="text-zinc-400">
          This deck has no playable dilemmas — every line needs an
          &quot;A | B&quot; pair.
        </p>
        <Button asChild variant="secondary">
          <Link href="/wouldyourather">Back to decks</Link>
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex min-h-[calc(100dvh-3.5rem)] max-w-2xl flex-col">
      <header className="mb-6 flex items-center justify-between text-sm text-zinc-400">
        <span className="truncate font-medium">{deck.name}</span>
        <Link href="/wouldyourather" className="transition-colors hover:text-white">
          Exit
        </Link>
      </header>

      {phase === "start" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="text-6xl" aria-hidden>
            🤷
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Would You Rather</h1>
            <p className="mt-2 max-w-sm text-zinc-400">
              {allDilemmas.length} impossible choices. Tap your pick, defend it
              to the group, then pass the phone.
            </p>
          </div>
          <Button
            onClick={startGame}
            className="h-auto w-full max-w-xs px-8 py-4 text-lg"
          >
            Start
          </Button>
          {chooser && (
            <p className="text-sm text-zinc-500">
              Playing with {players.length} players — {players[0].name} goes
              first.
            </p>
          )}
        </div>
      )}

      {phase === "playing" && dilemma && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span aria-live="polite">
              {chooser ? (
                <>
                  It&apos;s{" "}
                  <span className="font-semibold text-violet-300">
                    {chooser.name}
                  </span>
                  &apos;s call
                </>
              ) : (
                "Group vote"
              )}
            </span>
            <span>
              {index + 1}/{dilemmas.length}
            </span>
          </div>

          <h2 className="text-center text-2xl font-bold text-white">
            Would you rather…
          </h2>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {(["a", "b"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => choose(side)}
                disabled={picked !== null && picked !== side}
                className={cn(
                  "flex min-h-36 flex-1 items-center justify-center rounded-2xl border p-6 text-center text-xl font-semibold leading-snug transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 sm:min-h-64",
                  picked === side
                    ? "scale-[1.02] border-violet-400 bg-violet-600/40 text-white shadow-lg shadow-violet-600/30"
                    : picked
                      ? "border-white/5 bg-white/[0.03] text-zinc-600"
                      : "border-white/10 bg-white/5 text-zinc-100 hover:border-violet-400/50 hover:bg-white/10 active:scale-[0.99]",
                )}
              >
                {dilemma[side]}
              </button>
            ))}
          </div>

          <div className="flex min-h-20 flex-col items-center justify-center gap-3 pb-2">
            {picked ? (
              <>
                <p
                  className="text-base font-medium text-violet-300"
                  aria-live="polite"
                >
                  {flavor}
                </p>
                <Button
                  onClick={next}
                  className="h-auto w-full max-w-xs py-3.5 text-base"
                >
                  {index + 1 >= dilemmas.length ? "Finish" : "Next →"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                Tap the option you&apos;d rather live with.
              </p>
            )}
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="text-6xl" aria-hidden>
            🎉
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Deck complete!</h2>
            <p className="mt-2 text-zinc-400">
              {dilemmas.length} dilemmas survived. Friendships… maybe.
            </p>
          </div>
          <Button
            onClick={startGame}
            className="h-auto w-full max-w-xs px-8 py-4 text-lg"
          >
            Play again
          </Button>
          <Link
            href="/wouldyourather"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Back to decks
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
