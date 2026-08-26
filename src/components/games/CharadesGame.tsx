"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/button-link";
import { Button } from "@/components/ui/button";
import {
  exitFullscreen,
  getOrientation,
  requestFullscreen,
  shuffleArray,
  vibrate,
} from "@/lib/utils";
import { shuffleFresh } from "@/lib/freshness";
import { useSeen } from "@/lib/use-seen";

const COUNTDOWN_SECONDS = 5;
const ROUND_SECONDS = 70;
const FLASH_MS = 600;

const SOUND_SRC = {
  correct: "/assets/charades/correct-guess.mp3",
  pass: "/assets/charades/wronganswer.mp3",
  end: "/assets/charades/success-game-ended.mp3",
} as const;

const soundCache = new Map<string, HTMLAudioElement>();

function playSound(name: keyof typeof SOUND_SRC) {
  const src = SOUND_SRC[name];
  let audio = soundCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    soundCache.set(src, audio);
  }
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // Autoplay may be blocked before the first user gesture; sound is optional.
  });
}

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

async function requestTiltPermission() {
  if (typeof DeviceOrientationEvent === "undefined") return;
  const eventClass = DeviceOrientationEvent as DeviceOrientationEventWithPermission;
  try {
    await eventClass.requestPermission?.();
  } catch {
    // Permission denied or unavailable; on-screen buttons still work.
  }
}

function lockLandscape() {
  const orientation = window.screen?.orientation as
    | (ScreenOrientation & { lock?: (mode: string) => Promise<void> })
    | undefined;
  void orientation?.lock?.("landscape")?.catch(() => {
    // Orientation lock is unsupported on some browsers (e.g. iOS Safari).
  });
}

function unlockOrientation() {
  const orientation = window.screen?.orientation as
    | (ScreenOrientation & { unlock?: () => void })
    | undefined;
  orientation?.unlock?.();
}

type Phase = "ready" | "countdown" | "playing" | "ended";

interface Answer {
  word: string;
  correct: boolean;
}

export default function CharadesGame({
  deck,
}: {
  deck: { id: string; name: string; content: Record<string, string[]> };
}) {
  const [words, setWords] = useState(() => shuffleFresh(deck.content.items ?? [], deck.id));
  const [phase, setPhase] = useState<Phase>("ready");
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flash, setFlash] = useState<"correct" | "pass" | null>(null);
  const [isLandscape, setIsLandscape] = useState(true);

  // Requires returning to the upright "on forehead" position between tilts.
  const tiltArmedRef = useRef(false);

  const currentWord = words[answers.length];
  useSeen(deck.id, currentWord);
  const correctCount = answers.filter((answer) => answer.correct).length;

  // Track screen orientation.
  useEffect(() => {
    if (!window.screen?.orientation) return;
    const update = () => setIsLandscape(getOrientation().startsWith("landscape"));
    update();
    window.screen.orientation.addEventListener("change", update);
    return () => window.screen.orientation.removeEventListener("change", update);
  }, []);

  // Tick the countdown and round timers.
  useEffect(() => {
    if (phase !== "countdown" && phase !== "playing") return;
    const id = setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const endRound = useCallback(() => {
    setPhase("ended");
    playSound("end");
    exitFullscreen();
    unlockOrientation();
  }, []);

  // Advance phases when a timer hits zero.
  useEffect(() => {
    if (secondsLeft > 0) return;
    if (phase === "countdown") {
      setSecondsLeft(ROUND_SECONDS);
      setPhase("playing");
    } else if (phase === "playing") {
      endRound();
    }
  }, [secondsLeft, phase, endRound]);

  // End the round early when every word has been answered.
  useEffect(() => {
    if (phase === "playing" && answers.length === words.length) {
      endRound();
    }
  }, [phase, answers.length, words.length, endRound]);

  const submitAnswer = useCallback((correct: boolean) => {
    setFlash(correct ? "correct" : "pass");
    playSound(correct ? "correct" : "pass");
    vibrate(correct ? 220 : [150, 150]);
    setAnswers((prev) =>
      prev.length < words.length
        ? [...prev, { word: words[prev.length], correct }]
        : prev,
    );
  }, [words]);

  // Clear the correct/pass flash after a short moment.
  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), FLASH_MS);
    return () => clearTimeout(id);
  }, [flash]);

  // Tilt controls: with the phone on your forehead, tilt down (screen to the
  // floor) for correct, tilt up (screen to the ceiling) for pass.
  useEffect(() => {
    if (phase !== "playing") return;
    const handleTilt = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;
      const isFlat = Math.abs(gamma) < 30;
      if (!isFlat) {
        if (Math.abs(gamma) > 50) tiltArmedRef.current = true;
        return;
      }
      if (!tiltArmedRef.current) return;
      tiltArmedRef.current = false;
      // Screen facing the floor has beta near +-180; facing the ceiling near 0.
      submitAnswer(Math.abs(beta) > 90);
    };
    window.addEventListener("deviceorientation", handleTilt);
    return () => window.removeEventListener("deviceorientation", handleTilt);
  }, [phase, submitAnswer]);

  // Leave fullscreen if the player navigates away mid-round.
  useEffect(() => () => exitFullscreen(), []);

  async function startGame() {
    await requestTiltPermission();
    requestFullscreen();
    lockLandscape();
    tiltArmedRef.current = false;
    setAnswers([]);
    setSecondsLeft(COUNTDOWN_SECONDS);
    setPhase("countdown");
  }

  function resetGame() {
    setWords(shuffleFresh(deck.content.items ?? [], deck.id));
    setAnswers([]);
    setSecondsLeft(COUNTDOWN_SECONDS);
    setPhase("ready");
  }

  if (words.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg text-zinc-300">This deck has no words yet.</p>
        <ButtonLink href="/charades" variant="secondary">
          Back to Charades
        </ButtonLink>
      </div>
    );
  }

  if (phase === "ready" || phase === "countdown") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        {phase === "countdown" ? (
          <>
            <p className="text-xl text-zinc-300">Phone on your forehead!</p>
            <p aria-live="assertive" className="text-8xl font-bold text-violet-300">
              {secondsLeft}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold sm:text-4xl">{deck.name}</h1>
            <ul className="max-w-md space-y-1 text-zinc-300">
              <li>Hold the phone in landscape against your forehead.</li>
              <li>Tilt down (or tap the right side) when they guess it.</li>
              <li>Tilt up (or tap the left side) to pass.</li>
            </ul>
            {!isLandscape && (
              <p className="font-semibold text-amber-300">
                Rotate your phone to landscape for the best experience.
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button onClick={startGame} className="h-auto px-8 py-3 text-lg">
                Start
              </Button>
              <ButtonLink href="/charades" variant="ghost">
                Exit
              </ButtonLink>
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === "playing") {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {!isLandscape ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-2xl font-semibold">Rotate your phone to landscape</p>
            <p className="text-zinc-400">The timer is still running!</p>
          </div>
        ) : (
          <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
            <button
              type="button"
              onClick={() => submitAnswer(false)}
              className="flex flex-col items-center justify-center gap-1 bg-white/5 text-2xl font-bold text-red-300 transition-colors hover:bg-red-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-400"
            >
              <span aria-hidden="true">✗</span>
              Pass
            </button>
            <div
              className={`relative flex flex-col items-center justify-center px-4 transition-colors duration-200 ${
                flash === "correct"
                  ? "bg-green-500/25"
                  : flash === "pass"
                    ? "bg-red-500/25"
                    : "bg-transparent"
              }`}
            >
              <p className="absolute top-4 text-3xl font-bold tabular-nums text-violet-300">
                {secondsLeft}
              </p>
              <p className="break-words text-center text-5xl font-bold sm:text-6xl">
                {currentWord ?? ""}
              </p>
              <p className="absolute top-16 h-6 text-lg font-semibold" aria-live="polite">
                {flash === "correct" && <span className="text-green-300">✓ Got it!</span>}
                {flash === "pass" && <span className="text-red-300">✗ Passed</span>}
              </p>
              <Button
                variant="ghost"
                onClick={endRound}
                className="absolute bottom-3 text-sm"
              >
                End round
              </Button>
            </div>
            <button
              type="button"
              onClick={() => submitAnswer(true)}
              className="flex flex-col items-center justify-center gap-1 bg-white/5 text-2xl font-bold text-green-300 transition-colors hover:bg-green-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-400"
            >
              <span aria-hidden="true">✓</span>
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      <h1 className="text-3xl font-bold">Round over!</h1>
      <p className="text-2xl font-semibold text-violet-300">
        {correctCount} / {answers.length} guessed
      </p>
      <div className="flex gap-3">
        <Button onClick={resetGame}>Play again</Button>
        <ButtonLink href="/charades" variant="secondary">
          Exit
        </ButtonLink>
      </div>
      {answers.length > 0 && (
        <ul className="w-full space-y-1.5 overflow-y-auto text-left">
          {answers.map((answer, index) => (
            <li
              key={`${answer.word}-${index}`}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
            >
              <span
                className={`font-bold ${answer.correct ? "text-green-300" : "text-red-300"}`}
              >
                {answer.correct ? "✓" : "✗"}
              </span>
              <span className="sr-only">{answer.correct ? "Guessed:" : "Passed:"}</span>
              <span className="text-lg">{answer.word}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
