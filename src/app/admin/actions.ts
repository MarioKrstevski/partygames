"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { deck } from "@/lib/schema";

function isAdmin(email: string | null | undefined): boolean {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function togglePublic(deckId: string, currentValue: boolean) {
  const user = await getUser();
  if (!user) redirect("/signin");
  if (!isAdmin(user.email)) redirect("/");

  await db
    .update(deck)
    .set({ isPublic: !currentValue })
    .where(eq(deck.id, deckId));

  revalidatePath("/admin");
}

export async function adminDeleteDeck(deckId: string, gameSlug: string) {
  const user = await getUser();
  if (!user) redirect("/signin");
  if (!isAdmin(user.email)) redirect("/");

  await db.delete(deck).where(eq(deck.id, deckId));

  revalidatePath("/admin");
  revalidatePath(`/${gameSlug}`);
}
