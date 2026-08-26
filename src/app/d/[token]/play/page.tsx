import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharedDeck } from "@/lib/decks";
import { getGame } from "@/lib/games";
import { GamePlayer } from "@/components/games/registry";
import TrackPlay from "@/app/[game]/play/[id]/TrackPlay";

interface SharedPlayPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: SharedPlayPageProps): Promise<Metadata> {
  const { token } = await params;
  const deck = await getSharedDeck(token);
  const game = deck ? getGame(deck.gameType) : null;
  return { title: game ? `Play ${game.title}` : "Play" };
}

/**
 * Playing straight from a share link. The token is the permission, so this
 * works for a private deck and without an account.
 */
export default async function SharedPlayPage({ params }: SharedPlayPageProps) {
  const { token } = await params;
  const deck = await getSharedDeck(token);
  if (!deck) notFound();

  const game = getGame(deck.gameType);
  if (!game) notFound();

  return (
    <>
      <TrackPlay deckId={deck.id} />
      <GamePlayer
        slug={game.slug}
        deck={{ id: deck.id, name: deck.name, content: deck.content }}
      />
    </>
  );
}
