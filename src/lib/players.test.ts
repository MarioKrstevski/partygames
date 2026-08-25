import { describe, expect, it } from "vitest";
import {
  pickPair,
  pickTarget,
  pickWeighted,
  type Player,
  type Roster,
  type RosterSettings,
} from "./players";

function player(name: string, overrides: Partial<Player> = {}): Player {
  return { id: name, name, gender: "none", lucky: false, ...overrides };
}

const RANDOM: RosterSettings = { pairMode: "random", crossBias: 0.8 };
const BVG: RosterSettings = { pairMode: "boysvsgirls", crossBias: 1 };

describe("pickWeighted", () => {
  it("returns null for an empty pool", () => {
    expect(pickWeighted([])).toBeNull();
  });

  it("returns the only candidate", () => {
    const only = player("solo");
    expect(pickWeighted([only])).toBe(only);
  });

  it("picks lucky players roughly three times as often", () => {
    const lucky = player("lucky", { lucky: true });
    const normal = player("normal");
    let luckyHits = 0;
    const runs = 5000;
    for (let i = 0; i < runs; i++) {
      if (pickWeighted([lucky, normal]) === lucky) luckyHits++;
    }
    // Expected 75% with weight 3; allow a generous statistical margin.
    expect(luckyHits / runs).toBeGreaterThan(0.65);
    expect(luckyHits / runs).toBeLessThan(0.85);
  });
});

describe("pickTarget", () => {
  it("never picks the asker", () => {
    const a = player("a");
    const b = player("b");
    for (let i = 0; i < 100; i++) {
      expect(pickTarget([a, b], a, RANDOM)).toBe(b);
    }
  });

  it("always crosses gender at crossBias 1 when both pools exist", () => {
    const asker = player("asker", { gender: "boy" });
    const sameGender = player("same", { gender: "boy" });
    const crossGender = player("cross", { gender: "girl" });
    for (let i = 0; i < 100; i++) {
      expect(pickTarget([asker, sameGender, crossGender], asker, BVG)).toBe(
        crossGender,
      );
    }
  });

  it("falls back to anyone when no cross-gender candidate exists", () => {
    const asker = player("asker", { gender: "boy" });
    const other = player("other", { gender: "boy" });
    expect(pickTarget([asker, other], asker, BVG)).toBe(other);
  });

  it("ignores the mode for untagged askers", () => {
    const asker = player("asker"); // gender "none"
    const other = player("other", { gender: "girl" });
    expect(pickTarget([asker, other], asker, BVG)).toBe(other);
  });

  it("returns null when alone", () => {
    const only = player("solo");
    expect(pickTarget([only], only, RANDOM)).toBeNull();
  });
});

describe("pickPair", () => {
  const roster: Roster = {
    players: [player("a"), player("b"), player("c")],
    settings: RANDOM,
  };

  it("returns null with fewer than two players", () => {
    expect(
      pickPair({ players: [player("solo")], settings: RANDOM }, 0),
    ).toBeNull();
  });

  it("rotates the asker round-robin", () => {
    expect(pickPair(roster, 0)?.asker.name).toBe("a");
    expect(pickPair(roster, 1)?.asker.name).toBe("b");
    expect(pickPair(roster, 2)?.asker.name).toBe("c");
    expect(pickPair(roster, 3)?.asker.name).toBe("a");
  });

  it("never pairs a player with themselves", () => {
    for (let turn = 0; turn < 50; turn++) {
      const pair = pickPair(roster, turn);
      expect(pair).not.toBeNull();
      expect(pair!.asker.id).not.toBe(pair!.target.id);
    }
  });
});
