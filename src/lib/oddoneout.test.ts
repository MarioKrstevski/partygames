import { describe, expect, it } from "vitest";
import { normalize, scoreRound, type Answer } from "./oddoneout";

function answer(playerName: string, text: string): Answer {
  return { playerId: playerName, playerName, answer: text };
}

describe("normalize", () => {
  it("ignores case and surrounding space", () => {
    expect(normalize("  Banana ")).toBe(normalize("banana"));
  });

  it("ignores a leading article", () => {
    expect(normalize("the beach")).toBe(normalize("Beach"));
  });

  it("ignores trailing punctuation", () => {
    expect(normalize("pizza!")).toBe(normalize("pizza"));
  });

  it("keeps genuinely different answers apart", () => {
    expect(normalize("banana")).not.toBe(normalize("lemon"));
  });
});

describe("scoreRound", () => {
  it("scores everyone in the majority group", () => {
    const result = scoreRound([
      answer("Ana", "Banana"),
      answer("Marko", "banana"),
      answer("Elena", "Lemon"),
    ]);
    expect(result.scorers.map((s) => s.playerName).sort()).toEqual([
      "Ana",
      "Marko",
    ]);
  });

  it("gives the Pink Cow to a lone dissenter", () => {
    const result = scoreRound([
      answer("Ana", "Banana"),
      answer("Marko", "Banana"),
      answer("Elena", "Lemon"),
    ]);
    expect(result.pinkCow?.playerName).toBe("Elena");
  });

  it("gives no Pink Cow when the room splits into three", () => {
    const result = scoreRound([
      answer("Ana", "Banana"),
      answer("Marko", "Lemon"),
      answer("Elena", "Mango"),
      answer("Ivan", "Banana"),
    ]);
    expect(result.pinkCow).toBeNull();
  });

  it("gives no Pink Cow when two players dissent together", () => {
    const result = scoreRound([
      answer("Ana", "Banana"),
      answer("Marko", "Banana"),
      answer("Elena", "Lemon"),
      answer("Ivan", "Lemon"),
    ]);
    expect(result.pinkCow).toBeNull();
  });

  it("scores nobody when every answer is unique", () => {
    const result = scoreRound([
      answer("Ana", "Banana"),
      answer("Marko", "Lemon"),
      answer("Elena", "Mango"),
    ]);
    expect(result.scorers).toEqual([]);
    expect(result.allDifferent).toBe(true);
    expect(result.pinkCow).toBeNull();
  });

  it("scores both groups when the largest is tied", () => {
    const result = scoreRound([
      answer("Ana", "Banana"),
      answer("Marko", "Banana"),
      answer("Elena", "Lemon"),
      answer("Ivan", "Lemon"),
    ]);
    expect(result.scorers).toHaveLength(4);
  });

  it("orders groups largest first and keeps the original spelling", () => {
    const result = scoreRound([
      answer("Ana", "Lemon"),
      answer("Marko", "Banana"),
      answer("Elena", "banana"),
    ]);
    expect(result.groups[0].label).toBe("Banana");
    expect(result.groups[0].players).toHaveLength(2);
  });

  it("handles an empty round", () => {
    const result = scoreRound([]);
    expect(result.groups).toEqual([]);
    expect(result.scorers).toEqual([]);
    expect(result.pinkCow).toBeNull();
  });
});
