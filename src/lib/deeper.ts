/**
 * Deeper is built on threads rather than a flat list of questions: one opening
 * question and a run of follow-ups that each narrow the same subject. The
 * group chooses how far down to go, which is the whole game.
 */

export interface Thread {
  /** The opener, then each rung below it. Always at least two entries. */
  rungs: string[];
}

/** Deck lines are rungs separated by ">", shallowest first. */
export function parseThreads(lines: string[]): Thread[] {
  return lines.flatMap((line) => {
    const rungs = line
      .split(">")
      .map((rung) => rung.trim())
      .filter(Boolean);
    return rungs.length >= 2 ? [{ rungs }] : [];
  });
}

/** How far down this thread goes, 0..1, used to heat up the screen. */
export function intensityOf(level: number, total: number): number {
  if (total <= 1) return 0;
  return Math.min(1, Math.max(0, level / (total - 1)));
}

/**
 * Background for a given depth: calm violet at the top, dangerous red at the
 * bottom. The screen itself is the pressure gauge.
 */
/**
 * Hue for a depth. Travels the short way round the wheel — violet through
 * magenta to red. Going the other direction sweeps through green, which reads
 * as a bug rather than as heat.
 */
export function depthHue(level: number, total: number): number {
  return Math.round(265 + intensityOf(level, total) * 95);
}

export function depthGradient(level: number, total: number): string {
  const t = intensityOf(level, total);
  const hue = depthHue(level, total);
  const sat = Math.round(45 + t * 35);
  const light = Math.round(22 + t * 8);
  return `linear-gradient(180deg, hsl(${hue} ${sat}% ${light}%) 0%, hsl(${hue} ${sat}% ${Math.max(8, light - 12)}%) 100%)`;
}

/** Label for how deep the group has gone. */
export function depthLabel(level: number, total: number): string {
  const t = intensityOf(level, total);
  if (level === 0) return "Surface";
  if (t >= 1) return "Rock bottom";
  if (t >= 0.66) return "Too far";
  if (t >= 0.33) return "Getting personal";
  return "Warming up";
}
