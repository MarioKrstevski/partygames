import type { GameDef, GameSlug } from "./games";

export type Vibe = "chill" | "party" | "wild";
export type Tier = "light" | "medium" | "spicy";

/** A deck the planner is allowed to choose, flattened from the database. */
export interface PlannableDeck {
  id: string;
  name: string;
  gameType: string;
  tier: Tier;
}

export interface NightSlot {
  position: number;
  gameSlug: GameSlug;
  gameTitle: string;
  gameEmoji: string;
  deckId: string;
  deckName: string;
  tier: Tier;
  minutes: number;
  energy: "low" | "high";
}

export interface NightPlan {
  slots: NightSlot[];
  playerCount: number;
  vibe: Vibe;
  /** Sum of the slot durations — what the night actually adds up to. */
  totalMinutes: number;
}

export interface PlanOptions {
  playerCount: number;
  vibe: Vibe;
  /** How long the group wants to play, in minutes. */
  minutes: number;
}

const TIER_ORDER: Tier[] = ["light", "medium", "spicy"];

/**
 * How spicy slot `position` of `total` should be.
 *
 * A night should not open at full intensity — even a "wild" group needs a warm
 * up before anyone will answer the honest questions. Each vibe therefore ramps
 * across the evening rather than sitting at one level.
 */
export function tierForSlot(vibe: Vibe, position: number, total: number): Tier {
  if (vibe === "chill") return "light";
  const ratio = total <= 1 ? 0 : position / (total - 1);
  if (vibe === "party") return ratio < 0.4 ? "light" : "medium";
  return ratio < 0.25 ? "light" : ratio < 0.65 ? "medium" : "spicy";
}

/** Does this game work for the size of the room? */
export function fitsGroup(game: GameDef, playerCount: number): boolean {
  const min = game.minPlayers ?? 1;
  const max = game.maxPlayers ?? Number.POSITIVE_INFINITY;
  return playerCount >= min && playerCount <= max;
}

/**
 * Pick the deck closest to the wanted tier — a game with no spicy deck should
 * still be usable late in a wild night, just at the closest heat it has.
 */
export function pickDeck(
  decks: PlannableDeck[],
  wanted: Tier,
  pick: (max: number) => number,
): PlannableDeck | null {
  if (decks.length === 0) return null;
  const wantedIndex = TIER_ORDER.indexOf(wanted);
  let best: PlannableDeck[] = [];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const deck of decks) {
    const distance = Math.abs(TIER_ORDER.indexOf(deck.tier) - wantedIndex);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = [deck];
    } else if (distance === bestDistance) {
      best.push(deck);
    }
  }
  return best[pick(best.length)];
}

/**
 * Build a running order for the evening.
 *
 * Rules, in priority order:
 *  1. Only games that fit the group size are considered at all.
 *  2. No game appears twice until every eligible game has been used once.
 *  3. Energy alternates where possible — a room cannot shout for 90 minutes,
 *     and it cannot sit still for 90 minutes either.
 *  4. Heat escalates across the night according to the vibe.
 *
 * Returns as many slots as fit inside `minutes`, always at least one when any
 * game is eligible.
 */
export function planNight(
  options: PlanOptions,
  games: GameDef[],
  decks: PlannableDeck[],
  pick: (max: number) => number = (max) => Math.floor(Math.random() * max),
): NightPlan {
  const decksByGame = new Map<string, PlannableDeck[]>();
  for (const deck of decks) {
    decksByGame.set(deck.gameType, [
      ...(decksByGame.get(deck.gameType) ?? []),
      deck,
    ]);
  }

  const eligible = games.filter(
    (game) =>
      fitsGroup(game, options.playerCount) &&
      (decksByGame.get(game.slug)?.length ?? 0) > 0,
  );

  const slots: NightSlot[] = [];
  if (eligible.length === 0) {
    return {
      slots,
      playerCount: options.playerCount,
      vibe: options.vibe,
      totalMinutes: 0,
    };
  }

  // Rough slot count up front so the heat curve knows how long the night is.
  const averageMinutes =
    eligible.reduce((sum, g) => sum + g.minutes, 0) / eligible.length;
  const estimatedSlots = Math.max(
    1,
    Math.round(options.minutes / averageMinutes),
  );

  let used: GameSlug[] = [];
  let totalMinutes = 0;
  let lastEnergy: "low" | "high" | null = null;

  for (let position = 0; position < estimatedSlots; position++) {
    let pool = eligible.filter((game) => !used.includes(game.slug));
    if (pool.length === 0) {
      // Everything has been played once — start a fresh lap.
      used = [];
      pool = eligible;
    }

    // Prefer a change of pace, but never fail to fill a slot over it.
    const contrasting = pool.filter((game) => game.energy !== lastEnergy);
    const candidates = contrasting.length > 0 ? contrasting : pool;
    const game = candidates[pick(candidates.length)];

    const wantedTier = tierForSlot(options.vibe, position, estimatedSlots);
    const deck = pickDeck(decksByGame.get(game.slug) ?? [], wantedTier, pick);
    if (!deck) continue;

    // Stop before overshooting the requested length, but always place one slot.
    if (slots.length > 0 && totalMinutes + game.minutes > options.minutes) break;

    slots.push({
      position: slots.length,
      gameSlug: game.slug,
      gameTitle: game.title,
      gameEmoji: game.emoji,
      deckId: deck.id,
      deckName: deck.name,
      tier: deck.tier,
      minutes: game.minutes,
      energy: game.energy,
    });
    used.push(game.slug);
    totalMinutes += game.minutes;
    lastEnergy = game.energy;
  }

  return {
    slots,
    playerCount: options.playerCount,
    vibe: options.vibe,
    totalMinutes,
  };
}
