import { describe, expect, it } from "vitest";
import { copyName } from "./deck-copy";

describe("copyName", () => {
  it("keeps the original name when nothing clashes", () => {
    expect(copyName("Road Trip", [])).toBe("Road Trip");
  });

  it("adds (copy) on the first clash", () => {
    expect(copyName("Road Trip", ["Road Trip"])).toBe("Road Trip (copy)");
  });

  it("counts up when the copy itself clashes", () => {
    expect(copyName("Road Trip", ["Road Trip", "Road Trip (copy)"])).toBe(
      "Road Trip (copy 2)",
    );
  });

  it("does not stack suffixes when copying a copy", () => {
    expect(copyName("Road Trip (copy)", ["Road Trip (copy)"])).toBe(
      "Road Trip (copy 2)",
    );
  });

  it("compares names case-insensitively", () => {
    expect(copyName("Road Trip", ["road trip"])).toBe("Road Trip (copy)");
  });

  it("keeps the result inside the 60 character limit", () => {
    const long = "x".repeat(60);
    const result = copyName(long, [long]);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result.endsWith("(copy)")).toBe(true);
  });

  it("skips over a gap in the numbering", () => {
    expect(
      copyName("Deck", ["Deck", "Deck (copy)", "Deck (copy 3)"]),
    ).toBe("Deck (copy 2)");
  });
});
