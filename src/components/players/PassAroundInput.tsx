"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Player } from "@/lib/players";

export interface PassAroundEntry {
  playerId: string;
  playerName: string;
  text: string;
}

interface PassAroundInputProps {
  players: Player[];
  /** Shown above the input on every player's turn (the question or prompt). */
  prompt: string;
  /** Short instruction under the player's name, e.g. "Type your answer". */
  instruction: string;
  placeholder?: string;
  maxLength?: number;
  onComplete: (entries: PassAroundEntry[]) => void;
}

/**
 * Collects one secret text entry per player by passing the phone around.
 *
 * Each player gets a handoff gate (so the previous player's typing is off
 * screen before the next one looks), then types privately. Shared by Odd One
 * Out and Fibber.
 */
export default function PassAroundInput({
  players,
  prompt,
  instruction,
  placeholder,
  maxLength = 60,
  onComplete,
}: PassAroundInputProps) {
  const [index, setIndex] = useState(0);
  const [passing, setPassing] = useState(true);
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<PassAroundEntry[]>([]);

  const player = players[index];
  if (!player) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const next = [
      ...entries,
      { playerId: player.id, playerName: player.name, text: trimmed },
    ];
    setText("");

    if (index + 1 >= players.length) {
      onComplete(next);
      return;
    }
    setEntries(next);
    setIndex(index + 1);
    setPassing(true);
  }

  if (passing) {
    return (
      <Card className="space-y-4 p-5 py-10 text-center">
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          Player {index + 1} of {players.length}
        </p>
        <p className="text-4xl">📱</p>
        <p className="text-2xl font-bold">Pass to {player.name}</p>
        <p className="text-sm text-zinc-400">
          Everyone else look away — this one is secret.
        </p>
        <Button
          type="button"
          className="mx-auto h-auto w-full max-w-xs py-4 text-base"
          onClick={() => setPassing(false)}
        >
          I&apos;m {player.name}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
          {player.name}
        </p>
        <p className="mt-2 text-xl font-bold leading-snug">{prompt}</p>
        <p className="mt-1 text-sm text-zinc-400">{instruction}</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={instruction}
          maxLength={maxLength}
          autoFocus
        />
        <Button
          type="submit"
          disabled={!text.trim()}
          className="h-auto w-full py-4 text-base"
        >
          {index + 1 >= players.length ? "Lock it in →" : "Done — pass on"}
        </Button>
      </form>
    </Card>
  );
}
