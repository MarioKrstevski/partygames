import { describe, expect, it } from "vitest";
import {
  buildChain,
  chainSurvived,
  inputForStep,
  type ChainEntry,
} from "./doodlechain";
import type { Player } from "./players";

function player(name: string): Player {
  return { id: name, name, gender: "none", lucky: false };
}

const four = [player("Ana"), player("Marko"), player("Elena"), player("Ivan")];

function entry(
  index: number,
  kind: "draw" | "guess",
  value: string,
  playerName = "x",
): ChainEntry {
  return {
    step: { index, playerId: playerName, playerName, kind },
    value,
  };
}

describe("buildChain", () => {
  it("gives every player exactly one turn", () => {
    const chain = buildChain(four);
    expect(chain).toHaveLength(4);
    expect(new Set(chain.map((s) => s.playerId)).size).toBe(4);
  });

  it("starts with a drawing and alternates", () => {
    expect(buildChain(four).map((s) => s.kind)).toEqual([
      "draw",
      "guess",
      "draw",
      "guess",
    ]);
  });

  it("rotates who draws first", () => {
    expect(buildChain(four, 0)[0].playerName).toBe("Ana");
    expect(buildChain(four, 1)[0].playerName).toBe("Marko");
    expect(buildChain(four, 5)[0].playerName).toBe("Marko");
  });

  it("works with the three-player minimum", () => {
    const chain = buildChain(four.slice(0, 3));
    expect(chain.map((s) => s.kind)).toEqual(["draw", "guess", "draw"]);
  });
});

describe("inputForStep", () => {
  it("shows the secret word to the first artist", () => {
    const input = inputForStep(0, "Octopus", []);
    expect(input).toEqual({ kind: "word", value: "Octopus", secret: true });
  });

  it("shows a guesser only the drawing before them", () => {
    const entries = [entry(0, "draw", "data:image/png;base64,AAA")];
    expect(inputForStep(1, "Octopus", entries)).toEqual({
      kind: "image",
      value: "data:image/png;base64,AAA",
    });
  });

  it("shows a later artist only the guess before them", () => {
    const entries = [
      entry(0, "draw", "data:image/png;base64,AAA"),
      entry(1, "guess", "Squid"),
    ];
    expect(inputForStep(2, "Octopus", entries)).toEqual({
      kind: "word",
      value: "Squid",
      secret: false,
    });
  });

  it("never leaks a step older than the previous one", () => {
    const entries = [
      entry(0, "draw", "data:image/png;base64,AAA"),
      entry(1, "guess", "Squid"),
      entry(2, "draw", "data:image/png;base64,BBB"),
    ];
    const input = inputForStep(3, "Octopus", entries);
    expect(input.value).toBe("data:image/png;base64,BBB");
    expect(input.value).not.toContain("AAA");
  });
});

describe("chainSurvived", () => {
  it("is true when the final guess matches the secret word", () => {
    const entries = [entry(0, "draw", "img"), entry(1, "guess", "octopus")];
    expect(chainSurvived("Octopus", entries)).toBe(true);
  });

  it("forgives a leading article and trailing punctuation", () => {
    const entries = [entry(0, "draw", "img"), entry(1, "guess", "The Octopus!")];
    expect(chainSurvived("Octopus", entries)).toBe(true);
  });

  it("is false when the chain drifted", () => {
    const entries = [entry(0, "draw", "img"), entry(1, "guess", "Squid")];
    expect(chainSurvived("Octopus", entries)).toBe(false);
  });

  it("compares the last guess, not an earlier one", () => {
    const entries = [
      entry(0, "draw", "img"),
      entry(1, "guess", "Octopus"),
      entry(2, "draw", "img2"),
      entry(3, "guess", "Spider"),
    ];
    expect(chainSurvived("Octopus", entries)).toBe(false);
  });

  it("is false when nobody guessed at all", () => {
    expect(chainSurvived("Octopus", [entry(0, "draw", "img")])).toBe(false);
  });
});
