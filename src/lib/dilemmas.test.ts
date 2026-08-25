import { describe, expect, it } from "vitest";
import { parseDilemmas } from "./dilemmas";
import { GAMES } from "./games";

describe("parseDilemmas", () => {
  it("splits well-formed lines on the separator", () => {
    expect(parseDilemmas(["fly | be invisible"])).toEqual([
      { a: "fly", b: "be invisible" },
    ]);
  });

  it("trims whitespace around both options", () => {
    expect(parseDilemmas(["  fly   |   be invisible  "])).toEqual([
      { a: "fly", b: "be invisible" },
    ]);
  });

  it("skips lines without a separator", () => {
    expect(parseDilemmas(["no separator here"])).toEqual([]);
  });

  it("skips lines with an empty side", () => {
    expect(parseDilemmas(["fly |", "| be invisible", " | "])).toEqual([]);
  });

  it("splits on the first pipe only", () => {
    expect(parseDilemmas(["a | b | c"])).toEqual([{ a: "a", b: "b | c" }]);
  });
});

describe("would-you-rather deck validation", () => {
  const raw = GAMES.wouldyourather.sections[0].validateEntry!;
  const validate = { ...raw, pattern: new RegExp(raw.pattern) };

  it("accepts a well-formed dilemma line", () => {
    expect(validate.pattern.test("fly | be invisible")).toBe(true);
  });

  it("rejects a line without a separator", () => {
    expect(validate.pattern.test("just one option")).toBe(false);
  });

  it("rejects a line with two separators", () => {
    expect(validate.pattern.test("a | b | c")).toBe(false);
  });
});

describe("every seedable game section", () => {
  it("declares positive minimums", () => {
    for (const game of Object.values(GAMES)) {
      for (const section of game.sections) {
        expect(section.minItems).toBeGreaterThan(0);
      }
    }
  });

  it("uses unique section keys within each game", () => {
    for (const game of Object.values(GAMES)) {
      const keys = game.sections.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
