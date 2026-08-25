import { describe, expect, it } from "vitest";
import { buildOptions, parseTrivia, scoreVotes, type Option } from "./fibber";

describe("parseTrivia", () => {
  it("splits question from answer", () => {
    expect(parseTrivia(["What is 2+2? | Four"])).toEqual([
      { question: "What is 2+2?", answer: "Four" },
    ]);
  });

  it("skips malformed lines", () => {
    expect(parseTrivia(["no separator", "question only |", "| answer only"])).toEqual(
      [],
    );
  });
});

describe("buildOptions", () => {
  it("includes the real answer plus every fake", () => {
    const options = buildOptions("Vatican City", [
      { playerId: "a", playerName: "Ana", text: "Monaco" },
      { playerId: "b", playerName: "Marko", text: "Malta" },
    ]);
    expect(options).toHaveLength(3);
    expect(options.filter((o) => o.authorId === null)).toHaveLength(1);
  });

  it("drops a fake identical to the truth so it cannot appear twice", () => {
    const options = buildOptions("Vatican City", [
      { playerId: "a", playerName: "Ana", text: "vatican city" },
      { playerId: "b", playerName: "Marko", text: "Malta" },
    ]);
    expect(options).toHaveLength(2);
    expect(options.some((o) => o.authorName === "Ana")).toBe(false);
  });

  it("attributes each fake to its author", () => {
    const options = buildOptions("Truth", [
      { playerId: "a", playerName: "Ana", text: "Lie" },
    ]);
    const fake = options.find((o) => o.text === "Lie");
    expect(fake?.authorId).toBe("a");
    expect(fake?.authorName).toBe("Ana");
  });
});

describe("scoreVotes", () => {
  const options: Option[] = [
    { id: "truth", text: "Vatican City", authorId: null, authorName: null },
    { id: "fake-a", text: "Monaco", authorId: "a", authorName: "Ana" },
    { id: "fake-b", text: "Malta", authorId: "b", authorName: "Marko" },
  ];

  it("awards 2 points for finding the truth", () => {
    expect(scoreVotes([{ voterId: "c", optionId: "truth" }], options)).toEqual({
      c: 2,
    });
  });

  it("awards 1 point to the author of a fake that fooled someone", () => {
    expect(scoreVotes([{ voterId: "c", optionId: "fake-a" }], options)).toEqual({
      a: 1,
    });
  });

  it("scores nothing for voting for your own fake", () => {
    expect(scoreVotes([{ voterId: "a", optionId: "fake-a" }], options)).toEqual(
      {},
    );
  });

  it("accumulates across several votes", () => {
    // Ana's fake fools two players (+1 each) and she finds the truth (+2).
    const scores = scoreVotes(
      [
        { voterId: "b", optionId: "fake-a" },
        { voterId: "c", optionId: "fake-a" },
        { voterId: "a", optionId: "truth" },
      ],
      options,
    );
    expect(scores).toEqual({ a: 4 });
  });

  it("ignores votes for unknown options", () => {
    expect(scoreVotes([{ voterId: "c", optionId: "gone" }], options)).toEqual({});
  });
});
