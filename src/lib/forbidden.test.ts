import { describe, expect, it } from "vitest";
import {
  addPoint,
  describerFor,
  parseTabooCards,
  splitTeams,
  winnerOf,
} from "./forbidden";
import type { Player } from "./players";

function player(name: string): Player {
  return { id: name, name, gender: "none", lucky: false };
}

describe("parseTabooCards", () => {
  it("splits the word from its banned list", () => {
    expect(parseTabooCards(["Beach | sand, sea, sun, holiday"])).toEqual([
      { word: "Beach", banned: ["sand", "sea", "sun", "holiday"] },
    ]);
  });

  it("tolerates loose spacing", () => {
    expect(parseTabooCards(["  Beach  |sand ,  sea "])).toEqual([
      { word: "Beach", banned: ["sand", "sea"] },
    ]);
  });

  it("skips a line with no separator", () => {
    expect(parseTabooCards(["Beach"])).toEqual([]);
  });

  it("skips a line with no banned words", () => {
    expect(parseTabooCards(["Beach | "])).toEqual([]);
  });
});

describe("splitTeams", () => {
  it("deals players alternately rather than cutting the list in half", () => {
    const teams = splitTeams(["a", "b", "c", "d"].map(player));
    expect(teams.members[0].map((p) => p.name)).toEqual(["a", "c"]);
    expect(teams.members[1].map((p) => p.name)).toEqual(["b", "d"]);
  });

  it("gives the extra player to the first team on an odd roster", () => {
    const teams = splitTeams(["a", "b", "c"].map(player));
    expect(teams.members[0]).toHaveLength(2);
    expect(teams.members[1]).toHaveLength(1);
  });

  it("handles an empty roster", () => {
    const teams = splitTeams([]);
    expect(teams.members).toEqual([[], []]);
  });
});

describe("describerFor", () => {
  const teams = splitTeams(["a", "b", "c", "d"].map(player));

  it("rotates through a team's own members", () => {
    expect(describerFor(teams, 0, 0)?.name).toBe("a");
    expect(describerFor(teams, 0, 1)?.name).toBe("c");
    expect(describerFor(teams, 0, 2)?.name).toBe("a");
  });

  it("keeps each team's rotation independent", () => {
    expect(describerFor(teams, 1, 0)?.name).toBe("b");
    expect(describerFor(teams, 1, 1)?.name).toBe("d");
  });

  it("returns null when playing without a roster", () => {
    expect(describerFor(splitTeams([]), 0, 0)).toBeNull();
  });
});

describe("scoring", () => {
  it("adds a point to one team only", () => {
    expect(addPoint({ 0: 2, 1: 3 }, 1)).toEqual({ 0: 2, 1: 4 });
  });

  it("declares no winner below the target", () => {
    expect(winnerOf({ 0: 9, 1: 4 }, 10)).toBeNull();
  });

  it("declares the team that reached the target", () => {
    expect(winnerOf({ 0: 10, 1: 4 }, 10)).toBe(0);
  });

  it("requires a lead, so a tie at the target keeps playing", () => {
    expect(winnerOf({ 0: 10, 1: 10 }, 10)).toBeNull();
  });
});
