"use client";

/* eslint-disable @next/next/no-img-element -- drawings are in-memory data URLs, not assets */

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";
import DoodleCanvas, {
  type DoodleCanvasHandle,
} from "@/components/games/DoodleCanvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout";
import { vibrate } from "@/lib/utils";
import { pickFresh } from "@/lib/freshness";
import {
  buildChain,
  chainSurvived,
  inputForStep,
  type ChainEntry,
  type ChainStep,
} from "@/lib/doodlechain";

const DRAW_SECONDS = 60;

type Phase = "setup" | "handoff" | "brief" | "turn" | "reveal";

type DoodleChainGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function DoodleChainGame({ deck }: DoodleChainGameProps) {
  const { roster, update, ready } = usePlayers();
  const canvasRef = useRef<DoodleCanvasHandle>(null);

  const [phase, setPhase] = useState<Phase>("setup");
  const [chain, setChain] = useState<ChainStep[]>([]);
  const [entries, setEntries] = useState<ChainEntry[]>([]);
  const [secretWord, setSecretWord] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [strokes, setStrokes] = useState(0);
  const [round, setRound] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DRAW_SECONDS);
  const [timerOn, setTimerOn] = useState(false);

  const words = deck.content.words ?? [];
  const players = roster.players;
  const enoughPlayers = players.length >= 3;
  const step = chain[stepIndex];
  const input = step ? inputForStep(stepIndex, secretWord, entries) : null;

  // Drawing timer. Running out does not steal the pen — it just nudges.
  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimerOn(false);
          vibrate([120, 60, 120]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerOn]);

  function startRound() {
    if (words.length === 0 || !enoughPlayers) return;
    const word = pickFresh(words, deck.id);
    if (!word) return;
    setSecretWord(word);
    setChain(buildChain(players, round));
    setEntries([]);
    setStepIndex(0);
    setGuess("");
    setStrokes(0);
    setPhase("handoff");
  }

  function beginTurn() {
    setSecondsLeft(DRAW_SECONDS);
    setTimerOn(false);
    setStrokes(0);
    setPhase(step?.kind === "draw" ? "brief" : "turn");
  }

  function commit(value: string) {
    if (!step) return;
    const next = [...entries, { step, value }];
    setEntries(next);
    setGuess("");
    setTimerOn(false);

    if (stepIndex + 1 >= chain.length) {
      vibrate(120);
      setPhase("reveal");
      return;
    }
    setStepIndex(stepIndex + 1);
    setPhase("handoff");
  }

  function submitDrawing() {
    const dataUrl = canvasRef.current?.toDataURL() ?? "";
    if (!dataUrl) return;
    commit(dataUrl);
  }

  function submitGuess(event: FormEvent) {
    event.preventDefault();
    const trimmed = guess.trim();
    if (!trimmed) return;
    commit(trimmed);
  }

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/doodlechain" className="transition-colors hover:text-white">
        Exit
      </Link>
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
          <h1 className="text-3xl font-bold">🎨 Doodle Chain</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Draw the secret word. The next player sees only your drawing and
            writes what they think it is. The next sees only that word and draws
            it. Watch it fall apart.
          </p>
        </div>

        {!enoughPlayers && (
          <Card className="border-amber-400/30 bg-amber-400/10 p-5">
            <p className="text-sm text-amber-200">
              Needs at least <strong>3 players</strong> — add{" "}
              {3 - players.length} more below. Four or more is where it gets
              silly.
            </p>
          </Card>
        )}

        <PlayerSetup roster={roster} onChange={update} showModes={false} />

        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          disabled={!enoughPlayers || words.length === 0}
          onClick={startRound}
        >
          Start the chain
        </Button>
      </PageContainer>
    );
  }

  // ---- Handoff --------------------------------------------------------------
  if (phase === "handoff" && step) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Link {stepIndex + 1} of {chain.length}
          </span>
          <span>{step.kind === "draw" ? "✏️ drawing" : "💭 guessing"}</span>
        </div>
        <Card className="space-y-4 p-5 py-12 text-center">
          <p className="text-4xl">📱</p>
          <p className="text-2xl font-bold">Pass to {step.playerName}</p>
          <p className="text-sm text-zinc-400">
            {stepIndex === 0
              ? "You will get a secret word to draw. Nobody else may look."
              : step.kind === "draw"
                ? "You will see one word — draw it. Nobody else may look."
                : "You will see one drawing — name it. Nobody else may look."}
          </p>
          <Button
            type="button"
            className="mx-auto h-auto w-full max-w-xs py-4 text-base"
            onClick={beginTurn}
          >
            I&apos;m {step.playerName}
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Brief (the word to draw) ---------------------------------------------
  if (phase === "brief" && step && input?.kind === "word") {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <Card className="space-y-5 p-5 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            {input.secret ? "Secret word — draw this" : "Draw this"}
          </p>
          <p className="text-4xl font-bold leading-tight">{input.value}</p>
          <p className="text-sm text-zinc-400">
            No letters, no numbers, no charades gestures — just draw.
          </p>
          <Button
            type="button"
            className="mx-auto h-auto w-full max-w-xs py-4 text-base"
            onClick={() => {
              setPhase("turn");
              setTimerOn(true);
            }}
          >
            Got it — start drawing
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Turn: draw -----------------------------------------------------------
  if (phase === "turn" && step?.kind === "draw") {
    return (
      <PageContainer className="max-w-xl space-y-4">
        {header}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-violet-300">
            {step.playerName} is drawing
          </p>
          <p
            className={`text-sm tabular-nums ${
              secondsLeft === 0 ? "text-red-400" : "text-zinc-400"
            }`}
            aria-live="polite"
          >
            {secondsLeft === 0 ? "time's up — finish up!" : `${secondsLeft}s`}
          </p>
        </div>

        <DoodleCanvas ref={canvasRef} onStrokeCountChange={setStrokes} />

        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          disabled={strokes === 0}
          onClick={submitDrawing}
        >
          {strokes === 0 ? "Draw something first" : "Done — hide & pass on"}
        </Button>
      </PageContainer>
    );
  }

  // ---- Turn: guess ----------------------------------------------------------
  if (phase === "turn" && step?.kind === "guess" && input?.kind === "image") {
    return (
      <PageContainer className="max-w-xl space-y-4">
        {header}
        <p className="text-center text-sm font-semibold text-violet-300">
          {step.playerName}, what is this?
        </p>
        <img
          src={input.value}
          alt="The previous player's drawing"
          className="aspect-[4/3] w-full rounded-2xl border border-white/15 bg-white object-contain"
        />
        <form onSubmit={submitGuess} className="space-y-3">
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="One word or a short phrase…"
            aria-label="Your guess"
            maxLength={40}
            autoFocus
          />
          <Button
            type="submit"
            className="h-auto w-full py-4 text-base"
            disabled={!guess.trim()}
          >
            Lock it in — hide &amp; pass on
          </Button>
        </form>
      </PageContainer>
    );
  }

  // ---- Reveal ---------------------------------------------------------------
  if (phase === "reveal") {
    const survived = chainSurvived(secretWord, entries);
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}

        <Card
          className={`space-y-2 p-5 text-center ${
            survived
              ? "border-emerald-400/40 bg-emerald-500/10"
              : "border-violet-400/30 bg-violet-600/10"
          }`}
        >
          <p className="text-4xl">{survived ? "🎯" : "🌀"}</p>
          <h2 className="text-2xl font-bold">
            {survived ? "It survived!" : "Completely lost in translation"}
          </h2>
          <p className="text-sm text-zinc-300">
            It started as{" "}
            <span className="font-bold text-violet-300">{secretWord}</span>
          </p>
        </Card>

        <ol className="space-y-3">
          <li>
            <Card className="space-y-1 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                The word
              </p>
              <p className="text-xl font-bold">{secretWord}</p>
            </Card>
          </li>
          {entries.map((entry) => (
            <li key={entry.step.index}>
              <Card className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  {entry.step.playerName}{" "}
                  {entry.step.kind === "draw" ? "drew" : "guessed"}
                </p>
                {entry.step.kind === "draw" ? (
                  <img
                    src={entry.value}
                    alt={`Drawing by ${entry.step.playerName}`}
                    className="aspect-[4/3] w-full rounded-xl border border-white/10 bg-white object-contain"
                  />
                ) : (
                  <p className="text-xl font-bold">{entry.value}</p>
                )}
              </Card>
            </li>
          ))}
        </ol>

        <div className="space-y-2">
          <Button
            type="button"
            className="h-auto w-full py-4 text-base"
            onClick={() => {
              setRound(round + 1);
              startRound();
            }}
          >
            New word, new artist 🔄
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setPhase("setup")}
          >
            Edit players
          </Button>
        </div>
      </PageContainer>
    );
  }

  return null;
}
