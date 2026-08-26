import { describe, expect, it } from "vitest";
import {
  otherSide,
  pickSide,
  pickTwist,
  sideLabel,
  TWISTS,
} from "./flipside";

describe("sides", () => {
  it("labels both sides", () => {
    expect(sideLabel("agree")).toBe("AGREE");
    expect(sideLabel("disagree")).toBe("DISAGREE");
  });

  it("flips a side", () => {
    expect(otherSide("agree")).toBe("disagree");
    expect(otherSide("disagree")).toBe("agree");
  });

  it("picks either side from the extremes of randomness", () => {
    expect(pickSide(() => 0)).toBe("agree");
    expect(pickSide(() => 0.99)).toBe("disagree");
  });
});

describe("twists", () => {
  it("always returns a twist with a message and a clock", () => {
    for (let i = 0; i < 50; i++) {
      const twist = pickTwist();
      expect(twist.text("agree").length).toBeGreaterThan(0);
      expect(twist.seconds).toBeGreaterThan(0);
    }
  });

  it("names the side that has to switch", () => {
    const flip = TWISTS.find((t) => t.id === "flip")!;
    expect(flip.text("agree")).toContain("AGREE");
    expect(flip.text("disagree")).toContain("DISAGREE");
  });

  it("has a variant that switches both sides at once", () => {
    const both = TWISTS.find((t) => t.id === "both")!;
    expect(both.text("agree")).toBe(both.text("disagree"));
  });

  it("leans on the plain flip so the format stays recognisable", () => {
    const flips = TWISTS.filter((t) => t.id === "flip").length;
    expect(flips).toBeGreaterThan(1);
    expect(flips / TWISTS.length).toBeLessThan(0.6);
  });

  it("stays inside the array at the top of the random range", () => {
    expect(pickTwist(() => 0.999999)).toBeDefined();
  });
});
