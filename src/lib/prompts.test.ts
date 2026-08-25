import { describe, expect, it } from "vitest";
import { fillPlaceholders, hasPlaceholder } from "./prompts";
import type { Player } from "./players";

function player(name: string): Player {
  return { id: name, name, gender: "none", lucky: false };
}

const trio = [player("Ana"), player("Marko"), player("Elena")];
const always = () => 0; // deterministic "random"

describe("fillPlaceholders", () => {
  it("substitutes a single player", () => {
    expect(fillPlaceholders("{player}, stand up", trio, always)).toBe(
      "Ana, stand up",
    );
  });

  it("gives two placeholders two different players", () => {
    const filled = fillPlaceholders("{player} vs {player2}", trio, always);
    const [first, second] = filled.split(" vs ");
    expect(first).not.toBe(second);
  });

  it("lists everyone for {all}", () => {
    expect(fillPlaceholders("{all}: vote", trio, always)).toBe(
      "Ana, Marko, Elena: vote",
    );
  });

  it("replaces every occurrence of a placeholder", () => {
    expect(fillPlaceholders("{player} and {player} again", trio, always)).toBe(
      "Ana and Ana again",
    );
  });

  it("reuses the only player rather than failing on a solo roster", () => {
    const solo = [player("Ana")];
    expect(fillPlaceholders("{player} vs {player2}", solo, always)).toBe(
      "Ana vs Ana",
    );
  });

  it("returns the template untouched with no players", () => {
    expect(fillPlaceholders("{player} waits", [], always)).toBe("{player} waits");
  });

  it("leaves a template without placeholders alone", () => {
    expect(fillPlaceholders("Everyone drinks", trio, always)).toBe(
      "Everyone drinks",
    );
  });
});

describe("hasPlaceholder", () => {
  it("detects each supported placeholder", () => {
    expect(hasPlaceholder("{player} go")).toBe(true);
    expect(hasPlaceholder("{player2} go")).toBe(true);
    expect(hasPlaceholder("{all} go")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(hasPlaceholder("just a rule")).toBe(false);
  });
});
