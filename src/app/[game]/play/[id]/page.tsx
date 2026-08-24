import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { getPlayableDeck } from "@/lib/decks";
import { getGame } from "@/lib/games";
import { GamePlayer } from "@/components/games/registry";
import TrackPlay from "./TrackPlay";

interface PlayPageProps {
  params: { game: string; id: string };
}

export function generateMetadata({ params }: PlayPageProps): Metadata {
  const game = getGame(params.game);
  if (!game) return {};
  return { title: `Play ${game.title} — Party Games` };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const game = getGame(params.game);
  if (!game) notFound();

  const user = await getUser();
  const deck = await getPlayableDeck(params.id, user?.id);
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
