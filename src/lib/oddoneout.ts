export interface Answer {
  playerId: string;
  playerName: string;
  answer: string;
}

export interface AnswerGroup {
  /** The answer as the first player who gave it typed it. */
  label: string;
  players: Answer[];
}

export interface RoundResult {
  groups: AnswerGroup[];
  /** Players who matched the largest group — they score. */
  scorers: Answer[];
  /**
   * The single player who stood alone while everyone else agreed. Only set
   * when exactly one group has one player and every other player is in one
   * single group — that's the Pink Cow.
   */
  pinkCow: Answer | null;
  /** True when nobody matched anybody. */
  allDifferent: boolean;
}

/** Answers match case-insensitively, ignoring surrounding space and articles. */
export function normalize(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, "")
    .replace(/[.!?,]+$/, "");
}

/**
 * Group answers, decide who scores, and find the Pink Cow.
 *
 * Scoring follows Herd Mentality: think like the herd. Everyone in the largest
 * group scores. If several groups tie for largest, they all score — the round
 * simply has no clear herd. The Pink Cow only lands when a lone player broke
 * an otherwise unanimous room.
 */
export function scoreRound(answers: Answer[]): RoundResult {
  const byKey = new Map<string, AnswerGroup>();
  for (const answer of answers) {
    const key = normalize(answer.answer);
    const existing = byKey.get(key);
    if (existing) {
      existing.players.push(answer);
    } else {
      byKey.set(key, { label: answer.answer.trim(), players: [answer] });
    }
  }

  const groups = [...byKey.values()].sort(
    (a, b) => b.players.length - a.players.length,
  );

  if (groups.length === 0) {
    return { groups, scorers: [], pinkCow: null, allDifferent: false };
  }

  const largest = groups[0].players.length;
  const scorers =
    largest > 1 ? groups.filter((g) => g.players.length === largest).flatMap((g) => g.players) : [];

  const loners = groups.filter((g) => g.players.length === 1);
  const pinkCow =
    groups.length === 2 && loners.length === 1 && largest >= 2
      ? loners[0].players[0]
      : null;

  return {
    groups,
    scorers,
    pinkCow,
    allDifferent: largest === 1,
  };
}
