import { describe, expect, it } from "vitest";
import {
  depthGradient,
  depthHue,
  depthLabel,
  intensityOf,
  parseThreads,
} from "./deeper";

describe("parseThreads", () => {
  it("splits a line into rungs", () => {
    expect(parseThreads(["a > b > c"])).toEqual([{ rungs: ["a", "b", "c"] }]);
  });

  it("trims each rung", () => {
    expect(parseThreads(["  a   >  b  "])).toEqual([{ rungs: ["a", "b"] }]);
  });

  it("skips a line with no follow-up — a thread needs somewhere to go", () => {
    expect(parseThreads(["just one question"])).toEqual([]);
  });

  it("skips empty rungs rather than showing a blank card", () => {
    expect(parseThreads(["a > > b"])).toEqual([{ rungs: ["a", "b"] }]);
  });

  it("keeps long threads intact", () => {
    expect(parseThreads(["a > b > c > d > e"])[0].rungs).toHaveLength(5);
  });
});

describe("intensityOf", () => {
  it("is zero at the surface", () => {
    expect(intensityOf(0, 5)).toBe(0);
  });

  it("is one at the bottom", () => {
    expect(intensityOf(4, 5)).toBe(1);
  });

  it("climbs in between", () => {
    expect(intensityOf(2, 5)).toBeCloseTo(0.5);
  });

  it("does not divide by zero on a single rung", () => {
    expect(intensityOf(0, 1)).toBe(0);
  });

  it("clamps a level past the end", () => {
    expect(intensityOf(9, 5)).toBe(1);
  });
});

describe("depthGradient", () => {
  it("starts violet and ends red", () => {
    expect(depthGradient(0, 5)).toContain("hsl(265");
    expect(depthGradient(4, 5)).toContain("hsl(360");
  });

  it("never passes through green — that reads as a bug, not heat", () => {
    for (let level = 0; level < 8; level++) {
      const hue = Number(
        depthGradient(level, 8).match(/hsl\((\d+)/)![1],
      );
      expect(hue).toBeGreaterThanOrEqual(265);
      expect(hue).toBeLessThanOrEqual(360);
    }
  });

  it("always produces a usable gradient", () => {
    for (let level = 0; level < 6; level++) {
      expect(depthGradient(level, 6)).toMatch(/^linear-gradient\(180deg, hsl/);
    }
  });
});

describe("depthHue", () => {
  it("is the single source of the colour ramp", () => {
    expect(depthHue(0, 5)).toBe(265);
    expect(depthHue(4, 5)).toBe(360);
  });
});

describe("depthLabel", () => {
  it("names the surface", () => {
    expect(depthLabel(0, 5)).toBe("Surface");
  });

  it("names the bottom", () => {
    expect(depthLabel(4, 5)).toBe("Rock bottom");
  });

  it("escalates through the middle", () => {
    const labels = [1, 2, 3].map((l) => depthLabel(l, 5));
    expect(new Set(labels).size).toBeGreaterThan(1);
  });
});
