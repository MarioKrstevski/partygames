export interface Dilemma {
  a: string;
  b: string;
}

/**
 * Parse Would You Rather deck lines of the form "option A | option B".
 * Malformed lines (no separator, empty side) are skipped rather than thrown —
 * the deck editor validates on save, but old or hand-imported data shouldn't
 * crash the game.
 */
export function parseDilemmas(lines: string[]): Dilemma[] {
  return lines.flatMap((line) => {
    const split = line.indexOf("|");
    if (split === -1) return [];
    const a = line.slice(0, split).trim();
    const b = line.slice(split + 1).trim();
    return a && b ? [{ a, b }] : [];
  });
}
