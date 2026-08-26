"use client";

import { useState } from "react";
import Link from "next/link";
import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";
import { cn, shuffleArray, vibrate } from "@/lib/utils";
import {
  BANDS,
  maxPoints,
  parseSpectrums,
  randomTarget,
  rateGroup,
  scoreGuess,
  type Spectrum,
} from "@/lib/wavelength";

const ROUNDS = 6;

type Phase = "setup" | "handoff" | "clue" | "guess" | "reveal" | "finished";

type WavelengthGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

/** The scoring bands drawn as a target, widest first so they nest. */
function BandOverlay({ target }: { target: number }) {
  return (
    <>
      {[...BANDS].reverse().map((band) => {
        const left = Math.max(0, target - band.within);
        const right = Math.min(100, target + band.within);
        return (
          <div
            key={band.points}
            className={cn(
              "absolute inset-y-0 rounded",
              band.points === 4
                ? "bg-emerald-400/80"
                : band.points === 3
                  ? "bg-emerald-400/50"
                  : band.points === 2
                    ? "bg-amber-400/40"
                    : "bg-amber-400/20",
            )}
            style={{ left: `${left}%`, width: `${right - left}%` }}
          />
        );
      })}
    </>
  );
}

export default function WavelengthGame({ deck }: WavelengthGameProps) {
  const { roster, update, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("setup");
  const [spectrums, setSpectrums] = useState<Spectrum[]>([]);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(50);
  const [guess, setGuess] = useState(50);
  const [total, setTotal] = useState(0);

  const allSpectrums = parseSpectrums(deck.content.spectrums ?? []);
  const players = roster.players;
  const enoughPlayers = players.length >= 3;
  const spectrum = spectrums[round];
  const clueGiver = players.length > 0 ? players[round % players.length] : null;
  const result = scoreGuess(target, guess);

  function startGame() {
    if (allSpectrums.length === 0 || !enoughPlayers) return;
    setSpectrums(shuffleArray(allSpectrums));
    setRound(0);
    setTotal(0);
    setTarget(randomTarget());
    setGuess(50);
    setPhase("handoff");
  }

  function nextRound() {
    const scored = total + result.points;
    setTotal(scored);
    if (round + 1 >= Math.min(ROUNDS, spectrums.length)) {
      setPhase("finished");
      return;
    }
    setRound(round + 1);
    setTarget(randomTarget());
    setGuess(50);
    setPhase("handoff");
  }

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/wavelength" className="transition-colors hover:text-white">
        Exit
      </Link>
    </div>
  );

  const dial = spectrum && (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-semibold">
        <span className="max-w-[45%] text-left text-violet-300">
          {spectrum.left}
        </span>
        <span className="max-w-[45%] text-right text-pink-300">
          {spectrum.right}
        </span>
      </div>
      <div className="relative h-10 overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-violet-600/40 via-white/5 to-pink-500/40">
        {(phase === "clue" || phase === "reveal") && (
          <BandOverlay target={target} />
        )}
        {(phase === "guess" || phase === "reveal") && (
          <div
            aria-hidden
            className="absolute inset-y-0 w-1 -translate-x-1/2 rounded bg-white shadow-lg shadow-black/50"
            style={{ left: `${guess}%` }}
          />
        )}
      </div>
    </div>
  );

  if (!ready) {
    return (
      <PageContainer className="max-w-xl">
        {header}
        <p className="text-center text-zinc-500">Loading…</p>
      </PageContainer>
    );
  }

  // ---- Setup ----------------------------------------------------------------
  if (phase === "setup") {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div>
          <h1 className="text-3xl font-bold">📡 Wavelength</h1>
          <p className="mt-1 text-sm text-zinc-400">
            One player sees a hidden spot on the scale and gives a single clue.
            Everyone else moves the dial. You score together — {ROUNDS} rounds,
            {" "}
            {maxPoints(ROUNDS)} points on the table.
          </p>
        </div>

        {!enoughPlayers && (
          <Card className="border-amber-400/30 bg-amber-400/10 p-5">
            <p className="text-sm text-amber-200">
              Needs at least <strong>3 players</strong> — one to give the clue
              and at least two to argue about it.
            </p>
          </Card>
        )}

        <PlayerSetup roster={roster} onChange={update} showModes={false} />

        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          disabled={!enoughPlayers || allSpectrums.length === 0}
          onClick={startGame}
        >
          Start round 1
        </Button>
      </PageContainer>
    );
  }

  // ---- Handoff --------------------------------------------------------------
  if (phase === "handoff" && clueGiver) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Round {round + 1} of {Math.min(ROUNDS, spectrums.length)}
          </span>
          <span>{total} pts so far</span>
        </div>
        <Card className="space-y-4 p-5 py-12 text-center">
          <p className="text-4xl">📱</p>
          <p className="text-2xl font-bold">Pass to {clueGiver.name}</p>
          <p className="text-sm text-zinc-400">
            Only they may see the target. Everyone else, look away.
          </p>
          <Button
            type="button"
            className="mx-auto h-auto w-full max-w-xs py-4 text-base"
            onClick={() => setPhase("clue")}
          >
            I&apos;m {clueGiver.name}
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Clue (target visible) ------------------------------------------------
  if (phase === "clue" && spectrum && clueGiver) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <Card className="space-y-5 p-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
              {clueGiver.name} — this is the target
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Say one thing that sits exactly there. No numbers, no
              &ldquo;slightly left&rdquo;.
            </p>
          </div>
          {dial}
          <Button
            type="button"
            className="h-auto w-full py-4 text-base"
            onClick={() => setPhase("guess")}
          >
            Clue given — hide it &amp; pass on
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Guess (target hidden) ------------------------------------------------
  if (phase === "guess" && spectrum) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <Card className="space-y-5 p-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-300">
              Everyone else — where is it?
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Argue it out, then lock in one answer for the whole group.
            </p>
          </div>
          {dial}
          <input
            type="range"
            min={0}
            max={100}
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            aria-label="Your guess on the spectrum"
            className="w-full accent-violet-500"
          />
          <Button
            type="button"
            className="h-auto w-full py-4 text-base"
            onClick={() => {
              vibrate(60);
              setPhase("reveal");
            }}
          >
            Lock it in
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Reveal ---------------------------------------------------------------
  if (phase === "reveal" && spectrum) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <Card className="space-y-5 p-5">
          <div className="text-center">
            <p className="text-4xl">{result.points >= 3 ? "🎯" : result.points > 0 ? "👌" : "😬"}</p>
            <p className="mt-2 text-2xl font-bold">{result.label}</p>
            <p className="text-sm text-zinc-400">
              {result.distance} off — {result.points} point
              {result.points === 1 ? "" : "s"}
            </p>
          </div>
          {dial}
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Your guess: {guess}</span>
            <span>Target: {target}</span>
          </div>
          <Button
            type="button"
            className="h-auto w-full py-4 text-base"
            onClick={nextRound}
          >
            {round + 1 >= Math.min(ROUNDS, spectrums.length)
              ? "See how you did"
              : "Next round →"}
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Finished -------------------------------------------------------------
  if (phase === "finished") {
    const rounds = Math.min(ROUNDS, spectrums.length);
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <Card className="space-y-3 border-violet-400/40 bg-gradient-to-b from-violet-600/25 to-pink-500/10 p-6 text-center">
          <p className="text-5xl">📡</p>
          <h2 className="text-3xl font-bold">
            {total} / {maxPoints(rounds)}
          </h2>
          <p className="text-lg text-zinc-200">{rateGroup(total, rounds)}</p>
        </Card>
        <Button
          className="h-auto w-full py-4 text-base"
          onClick={startGame}
        >
          Go again 🔄
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setPhase("setup")}
        >
          Edit players
        </Button>
      </PageContainer>
    );
  }

  return null;
}
