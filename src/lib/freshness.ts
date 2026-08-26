"use client";

import { shuffleArray } from "./utils";

/**
 * Remembers which entries a phone has already been shown, so a deck serves
 * fresh material first — the second time you play Light Charades you get the
 * words you have not seen, not the same ten in a new order.
 *
 * Entries are stored as short hashes rather than full text: the store stays
 * small, and editing a deck naturally retires the old entries.
 */

const STORAGE_KEY = "pg.seen.v1";

type SeenStore = Record<string, string[]>;

/** djb2 — not cryptographic, just a compact stable id for a string. */
function hash(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function read(): SeenStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SeenStore) : {};
  } catch {
    return {};
  }
}

function write(store: SeenStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // A full or disabled storage should never stop a game.
  }
}

/** Hashes this phone has already been shown for a deck. */
export function seenFor(deckKey: string): Set<string> {
  return new Set(read()[deckKey] ?? []);
}

export function markSeen(deckKey: string, entries: string | string[]) {
  if (typeof window === "undefined") return;
  const list = Array.isArray(entries) ? entries : [entries];
  if (list.length === 0) return;

  const store = read();
  const current = new Set(store[deckKey] ?? []);
  for (const entry of list) current.add(hash(entry));
  store[deckKey] = [...current];
  write(store);
}

export function resetSeen(deckKey: string) {
  const store = read();
  delete store[deckKey];
  write(store);
}

/** How much of a deck this phone has already been through. */
export function freshness(
  deckKey: string,
  entries: string[],
): { seen: number; total: number } {
  const seen = seenFor(deckKey);
  return {
    seen: entries.filter((entry) => seen.has(hash(entry))).length,
    total: entries.length,
  };
}

/**
 * Games that parse their deck into objects pass a keyOf so marking and
 * filtering derive the same string — otherwise the hashes would never match.
 */
export type KeyOf<T> = (item: T) => string;

/**
 * Drop-in for shuffleArray that floats unseen entries to the front. Once a
 * deck has been exhausted the record is cleared and a fresh lap begins.
 */
export function shuffleFresh<T>(
  items: T[],
  deckKey: string,
  keyOf: KeyOf<T> = (item) => String(item),
): T[] {
  if (typeof window === "undefined" || items.length === 0) {
    return shuffleArray(items);
  }
  const seen = seenFor(deckKey);
  const unseen = items.filter((item) => !seen.has(hash(keyOf(item))));

  if (unseen.length === 0) {
    resetSeen(deckKey);
    return shuffleArray(items);
  }
  const alreadySeen = items.filter((item) => seen.has(hash(keyOf(item))));
  return [...shuffleArray(unseen), ...shuffleArray(alreadySeen)];
}

/**
 * Drop-in for a random pick that avoids anything already shown — this is what
 * stops a game drawing the same card twice in one evening. Marks its choice.
 */
export function pickFresh<T>(
  items: T[],
  deckKey: string,
  keyOf: KeyOf<T> = (item) => String(item),
): T | null {
  if (items.length === 0) return null;
  if (typeof window === "undefined") {
    return items[Math.floor(Math.random() * items.length)];
  }

  const seen = seenFor(deckKey);
  let pool = items.filter((item) => !seen.has(hash(keyOf(item))));
  if (pool.length === 0) {
    resetSeen(deckKey);
    pool = items;
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  markSeen(deckKey, keyOf(chosen));
  return chosen;
}
