import { beforeEach, describe, expect, it } from "vitest";
import {
  freshness,
  markSeen,
  pickFresh,
  resetSeen,
  seenFor,
  shuffleFresh,
} from "./freshness";

/** Minimal localStorage so the module can be tested outside a browser. */
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

const ITEMS = ["one", "two", "three", "four", "five"];

beforeEach(() => {
  const storage = new MemoryStorage();
  // @ts-expect-error - test double for the browser global
  globalThis.window = { localStorage: storage };
});

describe("markSeen / seenFor", () => {
  it("records an entry", () => {
    markSeen("deck", "one");
    expect(seenFor("deck").size).toBe(1);
  });

  it("does not double-count the same entry", () => {
    markSeen("deck", "one");
    markSeen("deck", "one");
    expect(seenFor("deck").size).toBe(1);
  });

  it("accepts a batch", () => {
    markSeen("deck", ["one", "two", "three"]);
    expect(seenFor("deck").size).toBe(3);
  });

  it("keeps decks independent", () => {
    markSeen("deck-a", "one");
    expect(seenFor("deck-b").size).toBe(0);
  });

  it("ignores an empty batch", () => {
    markSeen("deck", []);
    expect(seenFor("deck").size).toBe(0);
  });
});

describe("freshness", () => {
  it("counts how much of a deck has been shown", () => {
    markSeen("deck", ["one", "two"]);
    expect(freshness("deck", ITEMS)).toEqual({ seen: 2, total: 5 });
  });

  it("ignores entries that are no longer in the deck", () => {
    markSeen("deck", ["removed entry"]);
    expect(freshness("deck", ITEMS)).toEqual({ seen: 0, total: 5 });
  });
});

describe("shuffleFresh", () => {
  it("returns every entry", () => {
    markSeen("deck", ["one", "two"]);
    expect([...shuffleFresh(ITEMS, "deck")].sort()).toEqual([...ITEMS].sort());
  });

  it("puts unseen entries before seen ones", () => {
    markSeen("deck", ["one", "two"]);
    const ordered = shuffleFresh(ITEMS, "deck");
    expect(ordered.slice(0, 3).sort()).toEqual(["five", "four", "three"]);
  });

  it("starts a fresh lap once the deck is exhausted", () => {
    markSeen("deck", ITEMS);
    const ordered = shuffleFresh(ITEMS, "deck");
    expect(ordered).toHaveLength(5);
    expect(seenFor("deck").size).toBe(0);
  });

  it("handles an empty deck", () => {
    expect(shuffleFresh([], "deck")).toEqual([]);
  });
});

describe("pickFresh", () => {
  it("never repeats until the deck is used up", () => {
    const drawn = new Set<string>();
    for (let i = 0; i < ITEMS.length; i++) {
      const item = pickFresh(ITEMS, "deck");
      expect(item).not.toBeNull();
      expect(drawn.has(item!)).toBe(false);
      drawn.add(item!);
    }
    expect(drawn.size).toBe(ITEMS.length);
  });

  it("wraps around after every entry has been drawn", () => {
    for (let i = 0; i < ITEMS.length; i++) pickFresh(ITEMS, "deck");
    const next = pickFresh(ITEMS, "deck");
    expect(ITEMS).toContain(next);
  });

  it("marks what it hands out", () => {
    const picked = pickFresh(ITEMS, "deck");
    expect(freshness("deck", [picked!])).toEqual({ seen: 1, total: 1 });
  });

  it("returns null for an empty deck", () => {
    expect(pickFresh([], "deck")).toBeNull();
  });
});

describe("resetSeen", () => {
  it("clears one deck without touching another", () => {
    markSeen("deck-a", "one");
    markSeen("deck-b", "one");
    resetSeen("deck-a");
    expect(seenFor("deck-a").size).toBe(0);
    expect(seenFor("deck-b").size).toBe(1);
  });
});
