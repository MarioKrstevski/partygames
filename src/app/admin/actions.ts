"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUser, isAdminEmail } from "@/lib/auth";
import { deck } from "@/lib/schema";

export async function togglePublic(deckId: string, currentValue: boolean) {
  const user = await getUser();
  if (!user) redirect("/signin");
  if (!isAdminEmail(user.email)) redirect("/");

  await db
    .update(deck)
    .set({ isPublic: !currentValue })
    .where(eq(deck.id, deckId));

  revalidatePath("/admin");
}

export async function adminDeleteDeck(deckId: string, gameSlug: string) {
  const user = await getUser();
  if (!user) redirect("/signin");
  if (!isAdminEmail(user.email)) redirect("/");

  await db.delete(deck).where(eq(deck.id, deckId));

  revalidatePath("/admin");
  revalidatePath(`/${gameSlug}`);
}
