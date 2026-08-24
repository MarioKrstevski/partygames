"use client";

import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";
import { Card } from "@/components/ui";

export default function LabRoster() {
  const { roster, update, ready } = usePlayers();

  if (!ready) {
    return (
      <Card aria-busy="true" className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Players</h2>
          <p className="mt-0.5 text-sm text-zinc-400">Loading your group…</p>
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-white/5" />
      </Card>
    );
  }

  return <PlayerSetup roster={roster} onChange={update} showModes />;
}
