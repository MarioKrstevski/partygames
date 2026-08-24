import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { getPlayableDeck } from "@/lib/decks";
import { getGame } from "@/lib/games";
import { GamePlayer } from "@/components/games/registry";
import TrackPlay from "./TrackPlay";

interface PlayPageProps {
  params: Promise<{ game: string; id: string }>;
}

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const { game: slug, id } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return { title: `Play ${game.title} — Party Games` };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { game: slug, id } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const user = await getUser();
  const deck = await getPlayableDeck(id, user?.id);
  if (!deck || deck.gameType !== game.slug) notFound();

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
