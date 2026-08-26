import { describe, expect, it } from "vitest";
import {
  maxPoints,
  parseSpectrums,
  randomTarget,
  rateGroup,
  scoreGuess,
  TARGET_MAX,
  TARGET_MIN,
} from "./wavelength";

describe("parseSpectrums", () => {
  it("splits the two ends", () => {
    expect(parseSpectrums(["Overrated | Underrated"])).toEqual([
      { left: "Overrated", right: "Underrated" },
    ]);
  });

  it("skips malformed lines", () => {
    expect(parseSpectrums(["no separator", "left |", "| right"])).toEqual([]);
  });
});

describe("randomTarget", () => {
  it("stays inside the fair range at both extremes of randomness", () => {
    expect(randomTarget(() => 0)).toBe(TARGET_MIN);
    expect(randomTarget(() => 1)).toBe(TARGET_MAX);
  });

  it("never lands outside the range across many draws", () => {
    for (let i = 0; i < 500; i++) {
      const target = randomTarget();
      expect(target).toBeGreaterThanOrEqual(TARGET_MIN);
      expect(target).toBeLessThanOrEqual(TARGET_MAX);
    }
  });
});

describe("scoreGuess", () => {
  it("gives full marks for landing on the target", () => {
    expect(scoreGuess(50, 50).points).toBe(4);
  });

  it("scores the bands by distance", () => {
    expect(scoreGuess(50, 54).points).toBe(4);
    expect(scoreGuess(50, 58).points).toBe(3);
    expect(scoreGuess(50, 66).points).toBe(2);
    expect(scoreGuess(50, 76).points).toBe(1);
    expect(scoreGuess(50, 90).points).toBe(0);
  });

  it("scores the same in either direction", () => {
    expect(scoreGuess(50, 40).points).toBe(scoreGuess(50, 60).points);
  });

  it("reports the distance and a label", () => {
    const result = scoreGuess(50, 61);
    expect(result.distance).toBe(11);
    expect(result.label).toBe("In the region");
  });

  it("labels a miss", () => {
    expect(scoreGuess(10, 90).label).toBe("Nowhere near");
  });
});

describe("rateGroup", () => {
  it("caps out at the best possible score", () => {
    expect(maxPoints(5)).toBe(20);
    expect(rateGroup(20, 5)).toContain("Telepathic");
  });

  it("rates a poor night bluntly", () => {
    expect(rateGroup(1, 5)).toContain("strangers");
  });

  it("returns nothing for a night with no rounds", () => {
    expect(rateGroup(0, 0)).toBe("");
  });
});
