import { shuffleArray } from "./utils";

export interface TriviaCard {
  question: string;
  answer: string;
}

export interface Option {
  id: string;
  text: string;
  /** null for the real answer; otherwise the player who wrote the fake. */
  authorId: string | null;
  authorName: string | null;
}

export interface Fake {
  playerId: string;
  playerName: string;
  text: string;
}

export interface Vote {
  voterId: string;
  optionId: string;
}

/** Deck lines are "question | real answer". */
export function parseTrivia(lines: string[]): TriviaCard[] {
  return lines.flatMap((line) => {
    const split = line.indexOf("|");
    if (split === -1) return [];
    const question = line.slice(0, split).trim();
    const answer = line.slice(split + 1).trim();
    return question && answer ? [{ question, answer }] : [];
  });
}

/**
 * Mix the real answer in with the fakes. Fakes identical to the truth (someone
 * guessed it) are dropped so the answer can't appear twice — that player simply
 * fools nobody this round.
 */
export function buildOptions(realAnswer: string, fakes: Fake[]): Option[] {
  const truth = realAnswer.trim().toLowerCase();
  const options: Option[] = [
    { id: "truth", text: realAnswer.trim(), authorId: null, authorName: null },
  ];
  for (const fake of fakes) {
    if (fake.text.trim().toLowerCase() === truth) continue;
    options.push({
      id: `fake-${fake.playerId}`,
      text: fake.text.trim(),
      authorId: fake.playerId,
      authorName: fake.playerName,
    });
  }
  return shuffleArray(options);
}

/**
 * Psych scoring: 2 points for finding the real answer, 1 point to a player for
 * every other player their fake fooled. Voting for your own fake scores
 * nothing for anyone.
 */
export function scoreVotes(
  votes: Vote[],
  options: Option[],
): Record<string, number> {
  const byId = new Map(options.map((o) => [o.id, o]));
  const scores: Record<string, number> = {};
  const add = (playerId: string, points: number) => {
    scores[playerId] = (scores[playerId] ?? 0) + points;
  };

  for (const vote of votes) {
    const option = byId.get(vote.optionId);
    if (!option) continue;
    if (option.authorId === null) {
      add(vote.voterId, 2);
    } else if (option.authorId !== vote.voterId) {
      add(option.authorId, 1);
    }
  }
  return scores;
}
