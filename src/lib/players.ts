"use client";

/**
 * Client-side player roster + turn-picking engine for pass-the-phone games.
 * Stored in localStorage — no account or database involved.
 */

export type Gender = "boy" | "girl" | "none";

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  /** Weight multiplier for being picked as target. 1 = normal, 3 = "lucky". */
  lucky: boolean;
}

export type PairMode = "random" | "boysvsgirls";

export interface RosterSettings {
  pairMode: PairMode;
  /** In boysvsgirls mode: probability a pairing is cross-gender. */
  crossBias: number;
}

export interface Roster {
  players: Player[];
  settings: RosterSettings;
}

const STORAGE_KEY = "pg.roster.v1";
const LUCKY_WEIGHT = 3;

export const DEFAULT_ROSTER: Roster = {
  players: [],
  settings: { pairMode: "random", crossBias: 0.8 },
};

export function loadRoster(): Roster {
  if (typeof window === "undefined") return DEFAULT_ROSTER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROSTER;
    const parsed = JSON.parse(raw) as Roster;
    if (!Array.isArray(parsed.players)) return DEFAULT_ROSTER;
    return {
      players: parsed.players,
      settings: { ...DEFAULT_ROSTER.settings, ...parsed.settings },
    };
  } catch {
    return DEFAULT_ROSTER;
  }
}

export function saveRoster(roster: Roster) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
}

export function newPlayer(name: string): Player {
  return { id: crypto.randomUUID(), name: name.trim(), gender: "none", lucky: false };
}

// ---------------------------------------------------------------------------
// Picking
// ---------------------------------------------------------------------------

function weightOf(player: Player): number {
  return player.lucky ? LUCKY_WEIGHT : 1;
}

/** Weighted random pick. Returns null on an empty pool. */
export function pickWeighted(pool: Player[]): Player | null {
  if (pool.length === 0) return null;
  const total = pool.reduce((sum, p) => sum + weightOf(p), 0);
  let roll = Math.random() * total;
  for (const p of pool) {
    roll -= weightOf(p);
    if (roll <= 0) return p;
  }
  return pool[pool.length - 1];
}

/**
 * Pick a target for `asker`.
 *
 * In "boysvsgirls" mode, when the asker has a gender set and both a
 * cross-gender and a same-gender candidate exist, the pairing is cross-gender
 * with probability settings.crossBias (default 0.8). In every other case it
 * falls back to a weighted random pick over everyone else — the mode never
 * blocks play on an unbalanced or untagged roster.
 */
export function pickTarget(
  players: Player[],
  asker: Player,
  settings: RosterSettings,
): Player | null {
  let pool = players.filter((p) => p.id !== asker.id);
  if (
    settings.pairMode === "boysvsgirls" &&
    (asker.gender === "boy" || asker.gender === "girl")
  ) {
    const cross = pool.filter(
      (p) => p.gender !== "none" && p.gender !== asker.gender,
    );
    const same = pool.filter((p) => p.gender === asker.gender);
    if (cross.length > 0 && same.length > 0) {
      pool = Math.random() < settings.crossBias ? cross : same;
    } else if (cross.length > 0) {
      pool = cross;
    }
  }
  return pickWeighted(pool);
}

/** Round-robin asker + rule-based target. */
export function pickPair(
  roster: Roster,
  turnIndex: number,
): { asker: Player; target: Player } | null {
  const { players, settings } = roster;
  if (players.length < 2) return null;
  const asker = players[turnIndex % players.length];
  const target = pickTarget(players, asker, settings);
  if (!target) return null;
  return { asker, target };
}
