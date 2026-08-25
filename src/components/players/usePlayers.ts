"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_ROSTER,
  loadRoster,
  saveRoster,
  type Roster,
} from "@/lib/players";

/**
 * Roster state synced with localStorage. Starts from the empty default on
 * the server render and hydrates from storage on mount (SSR-safe).
 */
export function usePlayers() {
  const [roster, setRoster] = useState<Roster>(DEFAULT_ROSTER);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRoster(loadRoster());
    setReady(true);
  }, []);

  function update(next: Roster | ((current: Roster) => Roster)) {
    setRoster((current) => {
      const value = typeof next === "function" ? next(current) : next;
      saveRoster(value);
      return value;
    });
  }

  return { roster, update, ready };
}
