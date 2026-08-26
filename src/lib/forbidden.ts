import type { Player } from "./players";

export interface TabooCard {
  word: string;
  banned: string[];
}

export type TeamId = 0 | 1;

export interface Teams {
  names: [string, string];
  /** Player ids per team. Empty when playing without a roster. */
  members: [Player[], Player[]];
}

export const TEAM_NAMES: [string, string] = ["Team Violet", "Team Pink"];

/** Deck lines are "WORD | banned, banned, banned". */
export function parseTabooCards(lines: string[]): TabooCard[] {
  return lines.flatMap((line) => {
    const split = line.indexOf("|");
    if (split === -1) return [];
    const word = line.slice(0, split).trim();
    const banned = line
      .slice(split + 1)
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    return word && banned.length > 0 ? [{ word, banned }] : [];
  });
}

/**
 * Split the roster into two teams by dealing alternately down the list, so a
 * roster entered as couples or cliques does not end up stacked on one side.
 */
export function splitTeams(players: Player[]): Teams {
  const members: [Player[], Player[]] = [[], []];
  players.forEach((player, index) => {
    members[(index % 2) as TeamId].push(player);
  });
  return { names: TEAM_NAMES, members };
}

/** Whose turn it is to describe for `team`, given how many turns they've had. */
export function describerFor(
  teams: Teams,
  team: TeamId,
  turnsTaken: number,
): Player | null {
  const roster = teams.members[team];
  if (roster.length === 0) return null;
  return roster[turnsTaken % roster.length];
}

export interface Scores {
  0: number;
  1: number;
}

export function addPoint(scores: Scores, team: TeamId): Scores {
  return { ...scores, [team]: scores[team] + 1 };
}

/** The winner once someone reaches the target, otherwise null. */
export function winnerOf(scores: Scores, target: number): TeamId | null {
  if (scores[0] >= target && scores[0] > scores[1]) return 0;
  if (scores[1] >= target && scores[1] > scores[0]) return 1;
  return null;
}
