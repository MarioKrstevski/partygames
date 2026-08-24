"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { randomNumber, shuffleArray, vibrate } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui";

type Phase = "idle" | "countdown" | "armed" | "boom";

const COUNTDOWN_SECONDS = 3;
const MIN_FUSE_MS = 10_000;
const MAX_FUSE_MS = 40_000;

const armedBackgrounds = [
  "bg-gradient-to-b from-violet-950 via-violet-900 to-[#0d0a1a]",
  "bg-gradient-to-b from-fuchsia-950 via-fuchsia-900 to-[#0d0a1a]",
  "bg-gradient-to-b from-indigo-950 via-indigo-900 to-[#0d0a1a]",
];

export default function BoomItGame({
  deck,
}: {
  deck: { id: string; name: string; content: Record<string, string[]> };
}) {
  const sourceStatements = useMemo(
    () => deck.content.statements ?? [],
    [deck.content.statements],
  );
  const punishments = useMemo(
    () => deck.content.punishments ?? [],
    [deck.content.punishments],
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [statements, setStatements] = useState<string[]>([]);
  const [statementIndex, setStatementIndex] = useState(0);
  const [punishment, setPunishment] = useState<string | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Pre-round countdown: 3, 2, 1 -> armed.
  useEffect(() => {
    if (phase !== "countdown") return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhase("armed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // While armed: hidden bomb fuse + looping tick sound. Everything is
  // cleaned up when the phase changes or the component unmounts.
  useEffect(() => {
    if (phase !== "armed") return;

    const fuse = setTimeout(() => {
      vibrate([300, 100, 500]);
      setPunishment(
        punishments.length > 0
          ? punishments[randomNumber(0, punishments.length - 1)]
          : null,
      );
      setPhase("boom");
    }, randomNumber(MIN_FUSE_MS, MAX_FUSE_MS));

    const audio = tickAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay can be blocked; the game still works without sound.
      });
    }

    return () => {
      clearTimeout(fuse);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [phase, punishments]);

  function startRound() {
    // Lazily create the tick audio inside a user gesture so mobile
    // browsers allow playback once the bomb is armed.
    if (!tickAudioRef.current) {
      const audio = new Audio("/assets/boomit/tick.mp3");
      audio.loop = true;
      tickAudioRef.current = audio;
    }
    setStatements(shuffleArray(sourceStatements));
    setStatementIndex(0);
    setPunishment(null);
    setCountdown(COUNTDOWN_SECONDS);
    setPhase("countdown");
  }

  function handleNextStatement() {
    vibrate(30);
    if (statementIndex >= statements.length - 1) {
      setStatements(shuffleArray(statements));
      setStatementIndex(0);
    } else {
      setStatementIndex(statementIndex + 1);
    }
  }

  if (sourceStatements.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg text-zinc-300">
          This deck has no statements to play with yet.
        </p>
        <ButtonLink href="/boomit" variant="secondary">
          Back to Boom It
        </ButtonLink>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-8 px-6 text-center">
        <div>
          <p className="text-6xl" aria-hidden>
            &#128163;
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white">{deck.name}</h1>
          <p className="mt-3 max-w-sm text-zinc-300">
            Pass the phone around like a hot potato. Read the prompt, do it,
            then hit next. If the bomb goes off in your hands, you take the
            punishment.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button onClick={startRound} className="px-10 py-4 text-lg">
            Start round
          </Button>
          <ButtonLink href="/boomit" variant="ghost">
            Exit
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 bg-gradient-to-b from-violet-950 to-[#0d0a1a] text-center">
        <p
          className="text-8xl font-bold tabular-nums text-white"
          aria-live="assertive"
        >
          {countdown}
        </p>
        <p className="text-xl text-zinc-300">Prepare yourselves…</p>
      </div>
    );
  }

  if (phase === "boom") {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-8 bg-gradient-to-b from-red-950 via-red-900 to-[#0d0a1a] px-6 text-center">
        <div role="alert">
          <p className="text-7xl" aria-hidden>
            &#128165;
          </p>
          <h2 className="mt-4 text-4xl font-extrabold text-white">BOOM!</h2>
          <p className="mt-2 text-lg text-red-100">
            The bomb went off in your hands!
          </p>
          {punishment && (
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-red-300">
                Punishment
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {punishment}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button onClick={startRound} className="px-10 py-4 text-lg">
            Start new round
          </Button>
          <ButtonLink href="/boomit" variant="ghost">
            Exit
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[calc(100dvh-3.5rem)] flex-col ${
        armedBackgrounds[statementIndex % armedBackgrounds.length]
      }`}
    >
      <div className="flex justify-end p-4">
        <ButtonLink href="/boomit" variant="ghost">
          Exit
        </ButtonLink>
      </div>
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-center text-3xl font-semibold leading-snug text-white">
          {statements[statementIndex]}
        </p>
      </div>
      <div className="px-6 pb-12 pt-4">
        <Button
          onClick={handleNextStatement}
          className="w-full py-5 text-xl"
        >
          Next prompt
        </Button>
        <p className="mt-4 animate-pulse text-center text-sm text-zinc-400">
          Tick… tick… the bomb is live
        </p>
      </div>
    </div>
  );
}
