"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TierBadge } from "@/components/TierBadge";
import { GAMES } from "@/lib/games";
import {
  fitsGroup,
  planNight,
  type PlannableDeck,
  type Vibe,
} from "@/lib/night";
import { cn } from "@/lib/utils";
import {
  clearNight,
  loadNight,
  saveNight,
  type StoredNight,
} from "@/lib/night-storage";

const VIBES: { value: Vibe; label: string; blurb: string }[] = [
  { value: "chill", label: "🌤️ Chill", blurb: "Sober-friendly the whole way. Nothing anyone regrets." },
  { value: "party", label: "🎉 Party", blurb: "Warms up, gets personal, stops short of scandalous." },
  { value: "wild", label: "🔥 Wild", blurb: "Starts easy and ends somewhere you can't take back." },
];

const LENGTHS = [
  { minutes: 30, label: "Quick", blurb: "half an hour" },
  { minutes: 60, label: "An evening", blurb: "about an hour" },
  { minutes: 120, label: "Marathon", blurb: "two hours" },
];

interface NightPlannerProps {
  decks: PlannableDeck[];
}

export default function NightPlanner({ decks }: NightPlannerProps) {
  const [players, setPlayers] = useState(5);
  const [vibe, setVibe] = useState<Vibe>("party");
  const [minutes, setMinutes] = useState(60);
  const [night, setNight] = useState<StoredNight | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadNight();
    if (stored) {
      setNight(stored);
      setPlayers(stored.plan.playerCount);
      setVibe(stored.plan.vibe);
    }
    setReady(true);
  }, []);

  function build() {
    const plan = planNight(
      { playerCount: players, vibe, minutes },
      Object.values(GAMES),
      decks,
    );
    if (plan.slots.length === 0) return;
    const stored: StoredNight = { plan, done: [], startedAt: Date.now() };
    setNight(stored);
    saveNight(stored);
  }

  function update(next: StoredNight) {
    setNight(next);
    saveNight(next);
  }

  function markDone(position: number) {
    if (!night) return;
    update({ ...night, done: [...new Set([...night.done, position])] });
  }

  function reset() {
    clearNight();
    setNight(null);
  }

  if (!ready) {
    return <p className="text-center text-zinc-500">Loading…</p>;
  }

  // ---- Running a night ------------------------------------------------------
  if (night) {
    const { plan, done } = night;
    const current = plan.slots.find((slot) => !done.includes(slot.position));
    const finished = !current;
    const playedMinutes = plan.slots
      .filter((s) => done.includes(s.position))
      .reduce((sum, s) => sum + s.minutes, 0);

    return (
      <div className="space-y-6">
        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-violet-300">
                Tonight&apos;s line-up
              </p>
              <p className="text-sm text-zinc-400">
                {plan.playerCount} players · {plan.vibe} · {plan.totalMinutes}{" "}
                min
              </p>
            </div>
            <p className="shrink-0 text-right text-sm tabular-nums text-zinc-400">
              {done.length}/{plan.slots.length}
            </p>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={done.length}
            aria-valuemin={0}
            aria-valuemax={plan.slots.length}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
              style={{
                width: `${(done.length / plan.slots.length) * 100}%`,
              }}
            />
          </div>
        </Card>

        {finished ? (
          <Card className="space-y-3 border-emerald-400/40 bg-emerald-500/10 p-6 text-center">
            <p className="text-5xl">🏆</p>
            <h2 className="text-2xl font-bold">That&apos;s the whole night</h2>
            <p className="text-sm text-zinc-300">
              {plan.slots.length} games, {playedMinutes} minutes. Whatever was
              said tonight stays here.
            </p>
            <Button className="mx-auto h-auto max-w-xs py-4 text-base" onClick={reset}>
              Plan another night
            </Button>
          </Card>
        ) : (
          <Card className="space-y-4 border-violet-400/40 bg-gradient-to-b from-violet-600/25 to-pink-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">
              Up next — game {current.position + 1} of {plan.slots.length}
            </p>
            <div className="flex items-start gap-4">
              <span aria-hidden className="text-5xl">
                {current.gameEmoji}
              </span>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold">{current.gameTitle}</h2>
                <p className="truncate text-zinc-300">{current.deckName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <TierBadge tier={current.tier} />
                  <span className="text-xs text-zinc-400">
                    ~{current.minutes} min ·{" "}
                    {current.energy === "high" ? "⚡ loud" : "💬 talky"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild className="h-auto w-full py-4 text-base">
                <Link
                  href={`/${current.gameSlug}/play/${current.deckId}`}
                >
                  Play this →
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="h-auto w-full py-4 text-base"
                onClick={() => markDone(current.position)}
              >
                Done — next up
              </Button>
            </div>
            <p className="text-center text-xs text-zinc-400">
              Come back here when you&apos;re finished — the line-up is saved on
              this phone.
            </p>
          </Card>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            The running order
          </h3>
          <ol className="space-y-2">
            {plan.slots.map((slot) => {
              const isDone = done.includes(slot.position);
              const isCurrent = current?.position === slot.position;
              return (
                <li key={slot.position}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                      isCurrent
                        ? "border-violet-400/50 bg-violet-600/15"
                        : isDone
                          ? "border-white/5 bg-white/[0.02] opacity-60"
                          : "border-white/10 bg-white/5",
                    )}
                  >
                    <span aria-hidden className="text-2xl">
                      {isDone ? "✅" : slot.gameEmoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-semibold",
                          isDone && "line-through decoration-white/30",
                        )}
                      >
                        {slot.gameTitle}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        {slot.deckName} · ~{slot.minutes} min
                      </p>
                    </div>
                    {!isDone && !isCurrent && (
                      <button
                        type="button"
                        onClick={() => markDone(slot.position)}
                        className="shrink-0 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                      >
                        skip
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {!finished && (
          <Button variant="ghost" className="w-full" onClick={reset}>
            Start over with different settings
          </Button>
        )}
      </div>
    );
  }

  // ---- Setup ----------------------------------------------------------------
  const preview = planNight(
    { playerCount: players, vibe, minutes },
    Object.values(GAMES),
    decks,
  );
  // How many games the group size allows — distinct from how many fit the
  // chosen length, which is what the plan itself contains.
  const eligibleCount = Object.values(GAMES).filter((game) =>
    fitsGroup(game, players),
  ).length;

  return (
    <div className="space-y-5">
      <Card className="space-y-3 p-5">
        <div>
          <h2 className="text-lg font-semibold">How many of you?</h2>
          <p className="text-sm text-zinc-400">
            Games that do not work at this size are left out of the line-up.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            aria-label="One fewer player"
            onClick={() => setPlayers((p) => Math.max(2, p - 1))}
          >
            −
          </Button>
          <Input
            type="number"
            min={2}
            max={30}
            value={players}
            aria-label="Number of players"
            onChange={(e) =>
              setPlayers(Math.min(30, Math.max(2, Number(e.target.value) || 2)))
            }
            className="w-20 text-center text-lg font-bold"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            aria-label="One more player"
            onClick={() => setPlayers((p) => Math.min(30, p + 1))}
          >
            +
          </Button>
          <p className="text-sm text-zinc-400">
            {eligibleCount > 0
              ? `${eligibleCount} of ${Object.keys(GAMES).length} games work`
              : "no games work at this size"}
          </p>
        </div>
      </Card>

      <Card className="space-y-3 p-5">
        <h2 className="text-lg font-semibold">What kind of night?</h2>
        <div className="grid gap-2">
          {VIBES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setVibe(option.value)}
              aria-pressed={vibe === option.value}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-colors",
                vibe === option.value
                  ? "border-violet-400 bg-violet-600/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              )}
            >
              <p className="font-semibold">{option.label}</p>
              <p className="text-sm text-zinc-400">{option.blurb}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-5">
        <h2 className="text-lg font-semibold">How long have you got?</h2>
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map((option) => (
            <button
              key={option.minutes}
              type="button"
              onClick={() => setMinutes(option.minutes)}
              aria-pressed={minutes === option.minutes}
              className={cn(
                "rounded-xl border px-3 py-3 text-center transition-colors",
                minutes === option.minutes
                  ? "border-violet-400 bg-violet-600/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              )}
            >
              <p className="font-semibold">{option.label}</p>
              <p className="text-xs text-zinc-400">{option.blurb}</p>
            </button>
          ))}
        </div>
      </Card>

      <Button
        className="h-auto w-full py-5 text-lg"
        disabled={preview.slots.length === 0}
        onClick={build}
      >
        {preview.slots.length === 0
          ? "No games fit this group"
          : `Build the night — ${preview.slots.length} games`}
      </Button>
    </div>
  );
}
