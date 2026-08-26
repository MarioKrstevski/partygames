"use client";

import { useEffect } from "react";
import { markSeen } from "./freshness";

/**
 * Records an entry the moment it is put in front of the players.
 *
 * Marking at display time rather than at shuffle time is what keeps the record
 * honest: a group that opens a 60-card deck and plays six cards has seen six,
 * and the other 54 are still waiting for them next time.
 */
export function useSeen(deckKey: string, entry: string | null | undefined) {
  useEffect(() => {
    if (entry) markSeen(deckKey, entry);
  }, [deckKey, entry]);
}
