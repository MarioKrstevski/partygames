import type { Player } from "./players";

export type StepKind = "draw" | "guess";

export interface ChainStep {
  index: number;
  playerId: string;
  playerName: string;
  kind: StepKind;
}

export interface ChainEntry {
  step: ChainStep;
  /** Word text for a guess step, PNG data URL for a draw step. */
  value: string;
}

/** What the player at a step is allowed to see before taking their turn. */
export type StepInput =
  | { kind: "word"; value: string; secret: boolean }
  | { kind: "image"; value: string };

/**
 * Build the turn order for one chain.
 *
 * The first player secretly reads the word and draws it; from there turns
 * alternate guess, draw, guess… so nobody ever sees more than the single step
 * before their own. Every player takes exactly one turn, and `startIndex`
 * rotates who begins so the same person is not always the first artist.
 */
export function buildChain(players: Player[], startIndex = 0): ChainStep[] {
  return players.map((_, offset) => {
    const player = players[(startIndex + offset) % players.length];
    return {
      index: offset,
      playerId: player.id,
      playerName: player.name,
      kind: offset % 2 === 0 ? "draw" : "guess",
    };
  });
}

/**
 * What the player at `index` sees. Step 0 gets the secret word; a guess step
 * gets the drawing right before it; a later draw step gets the guess right
 * before it. Anything earlier stays hidden until the reveal.
 */
export function inputForStep(
  index: number,
  secretWord: string,
  entries: ChainEntry[],
): StepInput {
  if (index === 0) return { kind: "word", value: secretWord, secret: true };

  const previous = entries[index - 1];
  if (!previous) return { kind: "word", value: secretWord, secret: true };

  return previous.step.kind === "draw"
    ? { kind: "image", value: previous.value }
    : { kind: "word", value: previous.value, secret: false };
}

/**
 * Did the last word in the chain survive? Compared loosely — case, spacing and
 * a leading article do not count against the players.
 */
export function chainSurvived(
  secretWord: string,
  entries: ChainEntry[],
): boolean {
  const guesses = entries.filter((e) => e.step.kind === "guess");
  const last = guesses[guesses.length - 1];
  if (!last) return false;
  return normalizeWord(last.value) === normalizeWord(secretWord);
}

export function normalizeWord(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, "")
    .replace(/[.!?,]+$/, "");
}
