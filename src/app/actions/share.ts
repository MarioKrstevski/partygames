"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { deck } from "@/lib/schema";
import { getDeckNamesFor, getSharedDeck } from "@/lib/decks";
import { copyName } from "@/lib/deck-copy";
import { isGameSlug } from "@/lib/games";

export interface CopyDeckState {
  error?: string;
}

/**
 * Copy a shared deck into the signed-in user's own decks, so they can play it
 * without the link and edit it into their own thing.
 */
export async function copySharedDeck(
  token: string,
  _prev: CopyDeckState,
): Promise<CopyDeckState> {
  const user = await getUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/d/${token}`)}`);

  const source = await getSharedDeck(token);
  if (!source) return { error: "That deck no longer exists." };
  if (!isGameSlug(source.gameType)) {
    return { error: "That deck belongs to a game that is no longer available." };
  }

  if (source.userId === user.id) {
    return { error: "This deck is already yours." };
  }

  const [{ value: deckCount }] = await db
    .select({ value: count() })
    .from(deck)
    .where(eq(deck.userId, user.id));
  if (deckCount >= 100) {
    return { error: "You've reached the limit of 100 decks per account." };
  }

  const taken = await getDeckNamesFor(user.id, source.gameType);

  try {
    await db.insert(deck).values({
      userId: user.id,
      gameType: source.gameType,
      name: copyName(source.name, taken),
      description: source.description,
      language: source.language,
      tier: source.tier,
      // A copy is yours alone until you decide otherwise.
      isPublic: false,
      content: source.content,
    });
  } catch (e) {
    console.error("copySharedDeck failed", e);
    return { error: "Something went wrong copying the deck. Please try again." };
  }

  revalidatePath("/decks");
  revalidatePath(`/${source.gameType}`);
  redirect("/decks?saved=copied");
}
