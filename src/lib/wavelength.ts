export interface Spectrum {
  left: string;
  right: string;
}

/** Deck lines are "left end | right end". */
export function parseSpectrums(lines: string[]): Spectrum[] {
  return lines.flatMap((line) => {
    const split = line.indexOf("|");
    if (split === -1) return [];
    const left = line.slice(0, split).trim();
    const right = line.slice(split + 1).trim();
    return left && right ? [{ left, right }] : [];
  });
}

/** Targets stay off the extremes, where no clue could ever be fair. */
export const TARGET_MIN = 8;
export const TARGET_MAX = 92;

export function randomTarget(
  random: () => number = Math.random,
): number {
  return Math.round(TARGET_MIN + random() * (TARGET_MAX - TARGET_MIN));
}

export interface Band {
  /** Maximum distance from the target still inside this band. */
  within: number;
  points: number;
  label: string;
}

/** Concentric scoring bands, best first. */
export const BANDS: Band[] = [
  { within: 4, points: 4, label: "Dead on 🎯" },
  { within: 10, points: 3, label: "So close" },
  { within: 18, points: 2, label: "In the region" },
  { within: 28, points: 1, label: "Vaguely" },
];

export interface GuessResult {
  distance: number;
  points: number;
  label: string;
}

/** Score a guess by how near it landed to the hidden target. */
export function scoreGuess(target: number, guess: number): GuessResult {
  const distance = Math.abs(target - guess);
  const band = BANDS.find((b) => distance <= b.within);
  return {
    distance,
    points: band?.points ?? 0,
    label: band?.label ?? "Nowhere near",
  };
}

/** The best score a group could have managed — used to rate the night. */
export function maxPoints(rounds: number): number {
  return rounds * BANDS[0].points;
}

/** A verdict on how well the group reads each other, 0..1 of the maximum. */
export function rateGroup(scored: number, rounds: number): string {
  if (rounds === 0) return "";
  const ratio = scored / maxPoints(rounds);
  if (ratio >= 0.8) return "Telepathic. Genuinely unsettling.";
  if (ratio >= 0.6) return "You people clearly talk a lot.";
  if (ratio >= 0.4) return "Solid. You mostly get each other.";
  if (ratio >= 0.2) return "Some wires crossed tonight.";
  return "You may be strangers. Try talking more.";
}
