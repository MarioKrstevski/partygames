"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Input } from "@/components/ui";
import { newPlayer, type Gender, type Roster } from "@/lib/players";

const GENDER_CYCLE: Gender[] = ["none", "boy", "girl"];
const GENDER_LABEL: Record<Gender, string> = {
  none: "–",
  boy: "👦",
  girl: "👧",
};

interface PlayerSetupProps {
  roster: Roster;
  onChange: (next: Roster) => void;
  /** Show the pairing-mode controls (games that pick pairs want this). */
  showModes?: boolean;
}

export default function PlayerSetup({
  roster,
  onChange,
  showModes = true,
}: PlayerSetupProps) {
  const [name, setName] = useState("");

  function addPlayer(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (roster.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setName("");
      return;
    }
    onChange({ ...roster, players: [...roster.players, newPlayer(trimmed)] });
    setName("");
  }

  function cycleGender(id: string) {
    onChange({
      ...roster,
      players: roster.players.map((p) =>
        p.id === id
          ? {
              ...p,
              gender:
                GENDER_CYCLE[
                  (GENDER_CYCLE.indexOf(p.gender) + 1) % GENDER_CYCLE.length
                ],
            }
          : p,
      ),
    });
  }

  function toggleLucky(id: string) {
    onChange({
      ...roster,
      players: roster.players.map((p) =>
        p.id === id ? { ...p, lucky: !p.lucky } : p,
      ),
    });
  }

  function removePlayer(id: string) {
    onChange({
      ...roster,
      players: roster.players.filter((p) => p.id !== id),
    });
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Players</h2>
        <p className="mt-0.5 text-sm text-zinc-400">
          Saved on this phone only. Tap the circle to tag 👦/👧, the star to
          make someone &quot;lucky&quot; (picked more often).
        </p>
      </div>

      <form onSubmit={addPlayer} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a player…"
          aria-label="Player name"
          maxLength={30}
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>

      {roster.players.length > 0 && (
        <ul className="space-y-2">
          {roster.players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => cycleGender(player.id)}
                aria-label={`Change gender tag for ${player.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-sm hover:bg-white/10"
              >
                {GENDER_LABEL[player.gender]}
              </button>
              <span className="flex-1 truncate font-medium">{player.name}</span>
              <button
                type="button"
                onClick={() => toggleLucky(player.id)}
                aria-pressed={player.lucky}
                aria-label={`Toggle lucky for ${player.name}`}
                className={
                  player.lucky
                    ? "text-lg"
                    : "text-lg opacity-25 hover:opacity-60"
                }
              >
                ⭐
              </button>
              <button
                type="button"
                onClick={() => removePlayer(player.id)}
                aria-label={`Remove ${player.name}`}
                className="text-zinc-500 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModes && roster.players.length >= 2 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-zinc-200">Pairing mode</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={roster.settings.pairMode === "random" ? "primary" : "secondary"}
              onClick={() =>
                onChange({
                  ...roster,
                  settings: { ...roster.settings, pairMode: "random" },
                })
              }
            >
              🎲 Random
            </Button>
            <Button
              type="button"
              variant={
                roster.settings.pairMode === "boysvsgirls" ? "primary" : "secondary"
              }
              onClick={() =>
                onChange({
                  ...roster,
                  settings: { ...roster.settings, pairMode: "boysvsgirls" },
                })
              }
            >
              💘 Boys vs girls
            </Button>
          </div>
          {roster.settings.pairMode === "boysvsgirls" && (
            <p className="text-xs text-zinc-400">
              Pairings lean boy↔girl most of the time (needs 👦/👧 tags to work).
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
