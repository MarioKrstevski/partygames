"use server";

import { recordPlay } from "@/lib/decks";

export async function trackPlay(deckId: string) {
  await recordPlay(deckId);
}
