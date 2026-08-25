import { describe, expect, it } from "vitest";
import {
  fitsGroup,
  pickDeck,
  planNight,
  tierForSlot,
  type PlannableDeck,
} from "./night";
import { GAMES } from "./games";

const ALL_GAMES = Object.values(GAMES);

/** One deck of every tier for every game, so tier choice is never blocked. */
const FULL_CATALOG: PlannableDeck[] = ALL_GAMES.flatMap((game) =>
  (["light", "medium", "spicy"] as const).map((tier) => ({
    id: `${game.slug}-${tier}`,
    name: `${tier} ${game.title}`,
    gameType: game.slug,
    tier,
  })),
);

const always = () => 0;

describe("fitsGroup", () => {
  it("rejects a group below the minimum", () => {
    expect(fitsGroup(GAMES.wordspy, 2)).toBe(false);
  });

  it("accepts a group at the minimum", () => {
    expect(fitsGroup(GAMES.wordspy, 3)).toBe(true);
  });

  it("rejects a group above the maximum", () => {
    expect(fitsGroup(GAMES.doodlechain, 20)).toBe(false);
  });

  it("accepts a two-player game for two players", () => {
    expect(fitsGroup(GAMES.wouldyourather, 2)).toBe(true);
  });
});

describe("tierForSlot", () => {
  it("keeps a chill night light throughout", () => {
    expect(tierForSlot("chill", 0, 5)).toBe("light");
    expect(tierForSlot("chill", 4, 5)).toBe("light");
  });

  it("opens every vibe on light", () => {
    expect(tierForSlot("party", 0, 5)).toBe("light");
    expect(tierForSlot("wild", 0, 5)).toBe("light");
  });

  it("escalates a wild night to spicy by the end", () => {
    expect(tierForSlot("wild", 4, 5)).toBe("spicy");
  });

  it("never reaches spicy on a party night", () => {
    const tiers = [0, 1, 2, 3, 4].map((i) => tierForSlot("party", i, 5));
    expect(tiers).not.toContain("spicy");
  });

  it("handles a single-slot night without dividing by zero", () => {
    expect(tierForSlot("wild", 0, 1)).toBe("light");
  });
});

describe("pickDeck", () => {
  const decks: PlannableDeck[] = [
    { id: "l", name: "Light", gameType: "g", tier: "light" },
    { id: "s", name: "Spicy", gameType: "g", tier: "spicy" },
  ];

  it("returns an exact tier match when there is one", () => {
    expect(pickDeck(decks, "spicy", always)?.id).toBe("s");
  });

  it("falls back to the closest tier available", () => {
    expect(pickDeck(decks, "medium", always)?.id).toBe("l");
  });

  it("returns null with nothing to choose from", () => {
    expect(pickDeck([], "light", always)).toBeNull();
  });
});

describe("planNight", () => {
  it("fills roughly the requested length without overshooting", () => {
    const plan = planNight(
      { playerCount: 6, vibe: "party", minutes: 60 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    expect(plan.slots.length).toBeGreaterThan(1);
    expect(plan.totalMinutes).toBeLessThanOrEqual(60);
  });

  it("never schedules a game the group is too small for", () => {
    const plan = planNight(
      { playerCount: 2, vibe: "chill", minutes: 90 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    expect(plan.slots.length).toBeGreaterThan(0);
    for (const slot of plan.slots) {
      expect(GAMES[slot.gameSlug].minPlayers ?? 1).toBeLessThanOrEqual(2);
    }
  });

  it("never schedules a pass-around game for a huge group", () => {
    const plan = planNight(
      { playerCount: 12, vibe: "party", minutes: 90 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    const slugs = plan.slots.map((s) => s.gameSlug);
    expect(slugs).not.toContain("doodlechain");
    expect(slugs).not.toContain("fibber");
  });

  it("does not repeat a game before every eligible one has been used", () => {
    const plan = planNight(
      { playerCount: 6, vibe: "party", minutes: 60 },
      ALL_GAMES,
      FULL_CATALOG,
      (max) => max - 1, // a different deterministic picker
    );
    const slugs = plan.slots.map((s) => s.gameSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("alternates energy when both kinds are available", () => {
    const plan = planNight(
      { playerCount: 6, vibe: "party", minutes: 60 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    const energies = plan.slots.map((s) => s.energy);
    // With both high- and low-energy games eligible, no two neighbours match.
    for (let i = 1; i < energies.length; i++) {
      expect(energies[i]).not.toBe(energies[i - 1]);
    }
  });

  it("escalates heat across a wild night", () => {
    const plan = planNight(
      { playerCount: 6, vibe: "wild", minutes: 90 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    expect(plan.slots[0].tier).toBe("light");
    expect(plan.slots[plan.slots.length - 1].tier).toBe("spicy");
  });

  it("keeps a chill night entirely light", () => {
    const plan = planNight(
      { playerCount: 6, vibe: "chill", minutes: 60 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    expect(plan.slots.every((s) => s.tier === "light")).toBe(true);
  });

  it("returns an empty plan when no game fits the group", () => {
    const plan = planNight(
      { playerCount: 1, vibe: "chill", minutes: 60 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    expect(plan.slots).toEqual([]);
    expect(plan.totalMinutes).toBe(0);
  });

  it("skips games that have no deck at all", () => {
    const onlyCharades = FULL_CATALOG.filter((d) => d.gameType === "charades");
    const plan = planNight(
      { playerCount: 6, vibe: "party", minutes: 60 },
      ALL_GAMES,
      onlyCharades,
      always,
    );
    expect(plan.slots.every((s) => s.gameSlug === "charades")).toBe(true);
  });

  it("always places at least one slot even for a very short night", () => {
    const plan = planNight(
      { playerCount: 6, vibe: "party", minutes: 5 },
      ALL_GAMES,
      FULL_CATALOG,
      always,
    );
    expect(plan.slots.length).toBe(1);
  });
});
