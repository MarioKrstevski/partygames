"use client";

import type { NightPlan } from "./night";

export interface StoredNight {
  plan: NightPlan;
  /** Slot positions already played or skipped. */
  done: number[];
  startedAt: number;
}

const STORAGE_KEY = "pg.night.v1";

/**
 * The plan lives on the phone, not the server: playing a game navigates away
 * from the planner, so the line-up has to survive the round trip.
 */
export function loadNight(): StoredNight | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredNight;
    if (!parsed?.plan?.slots?.length) return null;
    return { ...parsed, done: Array.isArray(parsed.done) ? parsed.done : [] };
  } catch {
    return null;
  }
}

export function saveNight(night: StoredNight) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(night));
}

export function clearNight() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
