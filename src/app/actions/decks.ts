"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { deck, type DeckContent } from "@/lib/schema";
import { getGame, type GameDef } from "@/lib/games";

export interface DeckActionState {
  error?: string;
}

const metaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),
  description: z.string().trim().max(300, "Description is too long"),
  language: z.string().trim().min(2).max(12),
  isPublic: z.boolean(),
});

function parseContent(
  game: GameDef,
  formData: FormData,
): { content?: DeckContent; error?: string } {
  const content: DeckContent = {};
  for (const section of game.sections) {
    const raw = (formData.get(`content.${section.key}`) as string | null) ?? "";
    const items = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (items.length < section.minItems) {
      return {
        error: `${section.label}: add at least ${section.minItems} entries (one per line).`,
      };
    }
    if (items.some((item) => item.length > 200)) {
      return { error: `${section.label}: entries must be under 200 characters.` };
    }
    if (items.length > 500) {
      return { error: `${section.label}: maximum 500 entries.` };
    }
    content[section.key] = items;
  }
  return { content };
}

function parseDeckForm(gameSlug: string, formData: FormData) {
  const game = getGame(gameSlug);
  if (!game) return { error: "Unknown game." as string };

  const meta = metaSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    language: formData.get("language") || "en",
    isPublic: formData.get("isPublic") === "on",
  });
  if (!meta.success) {
    return { error: meta.error.issues[0]?.message ?? "Invalid input." };
  }
  const { content, error } = parseContent(game, formData);
  if (error || !content) return { error: error ?? "Invalid content." };
  return { game, meta: meta.data, content };
}

export async function createDeck(
  gameSlug: string,
  _prev: DeckActionState,
  formData: FormData,
): Promise<DeckActionState> {
  const user = await getUser();
  if (!user) redirect("/signin");

  const parsed = parseDeckForm(gameSlug, formData);
  if ("error" in parsed && parsed.error) return { error: parsed.error };
  const { game, meta, content } = parsed as Exclude<
    ReturnType<typeof parseDeckForm>,
    { error: string }
  >;

  const [{ value: deckCount }] = await db
    .select({ value: count() })
    .from(deck)
    .where(eq(deck.userId, user.id));
  if (deckCount >= 100) {
    return { error: "You've reached the limit of 100 decks per account." };
  }

  try {
    await db.insert(deck).values({
      userId: user.id,
      gameType: game.slug,
      name: meta.name,
      description: meta.description,
      language: meta.language,
      isPublic: meta.isPublic,
      content,
    });
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { error: `You already have a ${game.title} deck named "${meta.name}".` };
    }
    console.error("createDeck failed", e);
    return { error: "Something went wrong saving the deck. Please try again." };
  }

  revalidatePath(`/${game.slug}`);
  revalidatePath("/decks");
  redirect(`/${game.slug}`);
}

export async function updateDeck(
  gameSlug: string,
  deckId: string,
  _prev: DeckActionState,
  formData: FormData,
): Promise<DeckActionState> {
  const user = await getUser();
  if (!user) redirect("/signin");

  const parsed = parseDeckForm(gameSlug, formData);
  if ("error" in parsed && parsed.error) return { error: parsed.error };
  const { game, meta, content } = parsed as Exclude<
    ReturnType<typeof parseDeckForm>,
    { error: string }
  >;

  try {
    const updated = await db
      .update(deck)
      .set({
        name: meta.name,
        description: meta.description,
        language: meta.language,
        isPublic: meta.isPublic,
        content,
      })
      .where(
        and(
          eq(deck.id, deckId),
          eq(deck.userId, user.id),
          eq(deck.gameType, game.slug),
        ),
      )
      .returning({ id: deck.id });
    if (updated.length === 0) {
      return { error: "Deck not found or you don't own it." };
    }
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { error: `You already have a ${game.title} deck named "${meta.name}".` };
    }
    console.error("updateDeck failed", e);
    return { error: "Something went wrong saving the deck. Please try again." };
  }

  revalidatePath(`/${game.slug}`);
  revalidatePath("/decks");
  redirect(`/${game.slug}`);
}

export async function deleteDeck(
  gameSlug: string,
  deckId: string,
): Promise<DeckActionState> {
  const user = await getUser();
  if (!user) redirect("/signin");

  try {
    await db
      .delete(deck)
      .where(and(eq(deck.id, deckId), eq(deck.userId, user.id)));
  } catch (e) {
    console.error("deleteDeck failed", e);
    return { error: "Something went wrong deleting the deck. Please try again." };
  }

  revalidatePath(`/${gameSlug}`);
  revalidatePath("/decks");
  redirect(`/${gameSlug}`);
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "23505"
  );
}
