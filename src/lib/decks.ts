import { asc, and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "./db";
import { deck, deckPlay, type Deck } from "./schema";
import type { GameSlug } from "./games";

/** Decks a user can see in a game's list: public ones plus their own. */
export async function getVisibleDecks(
  gameType: GameSlug,
  userId?: string | null,
): Promise<Deck[]> {
  const visibility = userId
    ? or(eq(deck.isPublic, true), eq(deck.userId, userId))
    : eq(deck.isPublic, true);
  return db
    .select()
    .from(deck)
    .where(and(eq(deck.gameType, gameType), visibility))
    .orderBy(desc(deck.isPublic), desc(deck.updatedAt));
}

/** A deck for playing: must be public or owned by the viewer. */
export async function getPlayableDeck(
  id: string,
  userId?: string | null,
): Promise<Deck | null> {
  const rows = await db.select().from(deck).where(eq(deck.id, id)).limit(1);
  const found = rows[0];
  if (!found) return null;
  if (!found.isPublic && found.userId !== userId) return null;
  return found;
}

/** A deck for editing: must be owned by the viewer. */
export async function getOwnedDeck(
  id: string,
  userId: string,
): Promise<Deck | null> {
  const rows = await db
    .select()
    .from(deck)
    .where(and(eq(deck.id, id), eq(deck.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/** All decks created by a user, newest first. */
export async function getMyDecks(userId: string): Promise<Deck[]> {
  return db
    .select()
    .from(deck)
    .where(eq(deck.userId, userId))
    .orderBy(desc(deck.updatedAt));
}

/** All decks across all users, for the admin dashboard. */
export async function getAllDecks(): Promise<Deck[]> {
  return db
    .select()
    .from(deck)
    .orderBy(asc(deck.gameType), desc(deck.createdAt));
}

/** Record that a deck was played. */
export async function recordPlay(deckId: string): Promise<void> {
  await db.insert(deckPlay).values({ deckId });
}

/** Returns a map of deckId → play count. */
export async function getDeckPlayCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      deckId: deckPlay.deckId,
      count: sql<number>`count(*)::int`,
    })
    .from(deckPlay)
    .groupBy(deckPlay.deckId);

  return Object.fromEntries(rows.map((r) => [r.deckId, r.count]));
}

/** Returns a map of gameType → play count. */
export async function getGamePlayCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      gameType: deck.gameType,
      count: sql<number>`count(*)::int`,
    })
    .from(deckPlay)
    .innerJoin(deck, eq(deckPlay.deckId, deck.id))
    .groupBy(deck.gameType);

  return Object.fromEntries(rows.map((r) => [r.gameType, r.count]));
}

/** Every deck the night planner may schedule: public decks plus the user's own. */
export async function getPlannableDecks(
  userId?: string | null,
): Promise<Deck[]> {
  const visibility = userId
    ? or(eq(deck.isPublic, true), eq(deck.userId, userId))
    : eq(deck.isPublic, true);
  return db.select().from(deck).where(visibility).orderBy(asc(deck.name));
}
