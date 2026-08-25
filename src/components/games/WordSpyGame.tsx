"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";
import { randomNumber, shuffleArray, vibrate } from "@/lib/utils";
import type { Player } from "@/lib/players";

const DISCUSSION_SECONDS = 180;

type Phase = "setup" | "peek" | "discussion" | "vote" | "reveal";

interface Round {
  players: Player[];
  spyId: string;
  word: string;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type WordSpyGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function WordSpyGame({ deck }: WordSpyGameProps) {
  const { roster, update, ready } = usePlayers();
  const words = useMemo(() => deck.content.words ?? [], [deck.content.words]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<Round | null>(null);

  // Peek phase
  const [peekIndex, setPeekIndex] = useState(0);
  const [passing, setPassing] = useState(true); // "pass the phone" gate
  const [holdOpen, setHoldOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

  // Discussion timer
  const [secondsLeft, setSecondsLeft] = useState(DISCUSSION_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);

  // Vote / reveal
  const [votedId, setVotedId] = useState<string | null>(null);

  const revealed = holdOpen || toggleOpen;

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          vibrate([200, 100, 200]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const startRound = useCallback(() => {
    const players = roster.players;
    if (players.length < 3 || words.length === 0) return;
    const word = words[randomNumber(0, words.length - 1)];
    // Uniform random spy — no lucky weighting, everyone gets equal odds.
    const spy = players[randomNumber(0, players.length - 1)];
    setRound({
      players: shuffleArray(players),
      spyId: spy.id,
      word,
    });
    setPeekIndex(0);
    setPassing(true);
    setHoldOpen(false);
    setToggleOpen(false);
    setHasSeen(false);
    setSecondsLeft(DISCUSSION_SECONDS);
    setTimerRunning(false);
    setVotedId(null);
    setPhase("peek");
  }, [roster.players, words]);

  function nextPeek() {
    if (!round) return;
    setHoldOpen(false);
    setToggleOpen(false);
    setHasSeen(false);
    if (peekIndex + 1 >= round.players.length) {
      setPhase("discussion");
    } else {
      setPeekIndex(peekIndex + 1);
      setPassing(true);
    }
  }

  function show() {
    setHoldOpen(true);
    setHasSeen(true);
  }

  function hide() {
    setHoldOpen(false);
  }

  function onHoldKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.repeat) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      show();
    }
  }

  function onHoldKeyUp(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      hide();
    }
  }

  function castVote(playerId: string) {
    setVotedId(playerId);
    vibrate(80);
    setPhase("reveal");
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/wordspy" className="transition-colors hover:text-white">
        Exit
      </Link>
    </div>
  );

  if (!ready) {
    return (
      <PageContainer className="max-w-lg">
        {header}
        <p className="text-center text-zinc-500">Loading…</p>
      </PageContainer>
    );
  }

  // ---- Setup ----------------------------------------------------------------
  if (phase === "setup") {
    const enough = roster.players.length >= 3;
    return (
      <PageContainer className="max-w-lg space-y-5">
        {header}
        <div>
          <h1 className="text-2xl font-bold">🕵️ Word Spy</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Everyone secretly sees the same word — except one spy. Take turns
            describing it vaguely, then vote out the impostor.
          </p>
        </div>

        {!enough && (
          <>
            <Card className="border-amber-400/30 bg-amber-400/10 p-5">
              <p className="text-sm text-amber-200">
                Word Spy needs at least <strong>3 players</strong> — add{" "}
                {3 - roster.players.length} more below to start.
              </p>
            </Card>
            <PlayerSetup roster={roster} onChange={update} showModes={false} />
          </>
        )}

        {enough && (
          <>
            <Card className="space-y-1 p-5">
              <h2 className="text-lg font-semibold">
                Playing with {roster.players.length}
              </h2>
              <p className="text-sm text-zinc-400">
                {roster.players.map((p) => p.name).join(", ")}
              </p>
            </Card>

            <Button
              type="button"
              className="h-auto w-full py-4 text-base"
              onClick={startRound}
            >
              Start round
            </Button>

            <details className="text-sm text-zinc-400">
              <summary className="cursor-pointer font-medium text-zinc-300">
                Edit players
              </summary>
              <div className="mt-3">
                <PlayerSetup
                  roster={roster}
                  onChange={update}
                  showModes={false}
                />
              </div>
            </details>
          </>
        )}
      </PageContainer>
    );
  }

  if (!round) return null;

  const currentPlayer = round.players[peekIndex];
  const isSpy = currentPlayer.id === round.spyId;
  const spy = round.players.find((p) => p.id === round.spyId);
  const voted = round.players.find((p) => p.id === votedId);

  // ---- Peek -----------------------------------------------------------------
  if (phase === "peek") {
    if (passing) {
      return (
        <PageContainer className="max-w-lg space-y-5">
          {header}
          <Card className="space-y-4 p-5 py-10 text-center">
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              Player {peekIndex + 1} of {round.players.length}
            </p>
            <p className="text-3xl font-bold">
              Pass to {currentPlayer.name} 📱
            </p>
            <p className="text-sm text-zinc-400">No peeking, everyone else!</p>
            <Button
              type="button"
              className="mx-auto h-auto w-full max-w-xs py-4 text-base"
              onClick={() => setPassing(false)}
            >
              I&apos;m {currentPlayer.name}
            </Button>
          </Card>
        </PageContainer>
      );
    }

    return (
      <PageContainer className="max-w-lg space-y-5">
        {header}
        <Card className="space-y-5 p-5 text-center">
          <p className="text-lg font-semibold">{currentPlayer.name}</p>

          <div
            aria-live="polite"
            className="flex min-h-32 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-4 py-6"
          >
            {revealed ? (
              isSpy ? (
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-400">
                    You are the SPY 🕵️
                  </p>
                  <p className="text-sm text-zinc-300">
                    Blend in! Deck: {deck.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">The secret word is</p>
                  <p className="text-3xl font-bold text-violet-300">
                    {round.word}
                  </p>
                </div>
              )
            ) : (
              <p className="text-zinc-500">Hidden — hold below to look 👀</p>
            )}
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              show();
            }}
            onPointerUp={hide}
            onPointerLeave={hide}
            onPointerCancel={hide}
            onKeyDown={onHoldKeyDown}
            onKeyUp={onHoldKeyUp}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full touch-none select-none rounded-xl bg-violet-600 px-4 py-6 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500 active:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
          >
            {holdOpen ? "Release to hide" : "Hold to reveal"}
          </button>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              aria-pressed={toggleOpen}
              onClick={() => {
                setToggleOpen((v) => {
                  if (!v) setHasSeen(true);
                  return !v;
                });
              }}
            >
              {toggleOpen ? "Hide (tap mode)" : "Can't hold? Tap to show"}
            </Button>
            <Button type="button" disabled={!hasSeen} onClick={nextPeek}>
              {peekIndex + 1 >= round.players.length
                ? "Done → discuss"
                : "Hide & pass on"}
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  // ---- Discussion -----------------------------------------------------------
  if (phase === "discussion") {
    return (
      <PageContainer className="max-w-lg space-y-5">
        {header}
        <div>
          <h1 className="text-2xl font-bold">Discussion 🗣️</h1>
          <p className="mt-1 text-sm text-zinc-400">Deck: {deck.name}</p>
        </div>

        <Card className="space-y-2 p-5 text-sm text-zinc-300">
          <p>
            Take turns describing the word — but keep it <em>vague</em>. Too
            obvious and the spy learns the word; too cryptic and <em>you</em>{" "}
            look like the spy.
          </p>
          <p>The spy&apos;s job: bluff along and try to figure out the word.</p>
        </Card>

        <Card className="space-y-4 p-5 text-center">
          <p
            className={`text-6xl font-bold tabular-nums ${
              secondsLeft === 0 ? "text-red-400" : ""
            }`}
            aria-live="polite"
          >
            {formatTime(secondsLeft)}
          </p>
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (secondsLeft === 0) setSecondsLeft(DISCUSSION_SECONDS);
                setTimerRunning((r) => (secondsLeft === 0 ? true : !r));
              }}
            >
              {secondsLeft === 0
                ? "↺ Restart timer"
                : timerRunning
                  ? "⏸ Pause"
                  : "▶ Start timer"}
            </Button>
          </div>
          <p className="text-xs text-zinc-500">
            The 3-minute timer is optional — vote whenever you&apos;re ready.
          </p>
        </Card>

        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          onClick={() => {
            setTimerRunning(false);
            setPhase("vote");
          }}
        >
          Go to voting 🗳️
        </Button>
      </PageContainer>
    );
  }

  // ---- Vote -----------------------------------------------------------------
  if (phase === "vote") {
    return (
      <PageContainer className="max-w-lg space-y-5">
        {header}
        <div>
          <h1 className="text-2xl font-bold">Who is the spy? 🗳️</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Talk it out, then tap the player the group voted for.
          </p>
        </div>
        <div className="grid gap-2">
          {round.players.map((p) => (
            <Button
              key={p.id}
              type="button"
              variant="secondary"
              className="h-auto w-full justify-start py-4 text-base"
              onClick={() => castVote(p.id)}
            >
              {p.name}
            </Button>
          ))}
        </div>
      </PageContainer>
    );
  }

  // ---- Reveal ---------------------------------------------------------------
  const caught = votedId === round.spyId;
  return (
    <PageContainer className="max-w-lg space-y-5">
      {header}
      <Card className="space-y-4 p-5 py-8 text-center">
        <p className="text-5xl">{caught ? "🎯" : "😬"}</p>
        <h1 className="text-2xl font-bold">
          {caught
            ? `${voted?.name} was the spy!`
            : `${voted?.name} was innocent!`}
        </h1>
        {!caught && (
          <p className="text-lg text-zinc-300">
            The real spy was{" "}
            <span className="font-bold text-red-400">{spy?.name}</span> 🕵️
          </p>
        )}
        <p className="text-sm text-zinc-400">
          The word was{" "}
          <span className="font-bold text-violet-300">{round.word}</span> (
          {deck.name})
        </p>
      </Card>

      {caught && (
        <Card className="border-amber-400/30 bg-amber-400/10 p-5">
          <p className="text-sm text-amber-200">
            Last chance, {spy?.name}: the spy still wins if they can guess the
            word right now. One shot — say it out loud!
          </p>
        </Card>
      )}
      {!caught && (
        <Card className="border-red-400/30 bg-red-400/10 p-5">
          <p className="text-sm text-red-200">
            The spy survived the vote — spy wins this round!
          </p>
        </Card>
      )}

      <div className="grid gap-2">
        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          onClick={startRound}
        >
          Play again (new word &amp; spy) 🔄
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setPhase("setup")}
        >
          Change players
        </Button>
      </div>
    </PageContainer>
  );
}
