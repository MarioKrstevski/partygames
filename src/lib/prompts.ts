import type { Player } from "./players";

/**
 * Fill name placeholders in a Party Mode prompt.
 *
 * Supported: {player} and {player2} for two distinct random players, and
 * {all} for the whole group. A prompt needing more players than the roster has
 * reuses names rather than failing — the game should never stall on a small
 * group.
 */
export function fillPlaceholders(
  template: string,
  players: Player[],
  pick: (max: number) => number = (max) => Math.floor(Math.random() * max),
): string {
  if (players.length === 0) return template;

  const first = players[pick(players.length)];
  const others = players.filter((p) => p.id !== first.id);
  const second =
    others.length > 0 ? others[pick(others.length)] : first;

  return template
    .replace(/\{player2\}/g, second.name)
    .replace(/\{player\}/g, first.name)
    .replace(/\{all\}/g, players.map((p) => p.name).join(", "));
}

/** Does this prompt name anyone? Used to keep name-injected cards varied. */
export function hasPlaceholder(template: string): boolean {
  return /\{(player2?|all)\}/.test(template);
}
