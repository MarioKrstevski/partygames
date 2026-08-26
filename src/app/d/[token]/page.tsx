import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getSharedDeck } from "@/lib/decks";
import { getGame } from "@/lib/games";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/TierBadge";
import CopyDeckButton from "./CopyDeckButton";

interface SharedDeckPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: SharedDeckPageProps): Promise<Metadata> {
  const { token } = await params;
  const deck = await getSharedDeck(token);
  if (!deck) return { title: "Deck not found" };
  const game = getGame(deck.gameType);
  return {
    title: `${deck.name} — a ${game?.title ?? "Party Games"} deck`,
    description: deck.description || `A shared deck for ${game?.title}.`,
  };
}

export default async function SharedDeckPage({ params }: SharedDeckPageProps) {
  const { token } = await params;
  const deck = await getSharedDeck(token);
  if (!deck) notFound();

  const game = getGame(deck.gameType);
  if (!game) notFound();

  const user = await getUser();
  const isOwn = user?.id === deck.userId;
  const entryCount = Object.values(deck.content).reduce(
    (sum, items) => sum + items.length,
    0,
  );
  // A taste of the deck — enough to judge it, not the whole thing.
  const preview = Object.values(deck.content)[0]?.slice(0, 5) ?? [];

  return (
    <PageContainer className="max-w-xl space-y-6">
      <p className="text-sm text-zinc-400">
        <span aria-hidden>📤</span> Someone shared a deck with you
      </p>

      <Card className="space-y-4 border-violet-400/30 bg-gradient-to-b from-violet-600/20 to-pink-500/5 p-6">
        <div className="flex items-start gap-4">
          <span aria-hidden className="text-5xl">
            {game.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <p className="text-zinc-300">
              a {game.title} deck · {entryCount} entries
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TierBadge tier={deck.tier} />
              {!deck.isPublic && (
                <span className="rounded-full bg-zinc-500/20 px-2 py-0.5 text-xs font-medium text-zinc-300">
                  Link only
                </span>
              )}
            </div>
          </div>
        </div>

        {deck.description && (
          <p className="text-sm text-zinc-300">{deck.description}</p>
        )}

        {preview.length > 0 && (
          <div className="space-y-1 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              A taste
            </p>
            <ul className="space-y-1 text-sm text-zinc-300">
              {preview.map((entry) => (
                <li key={entry} className="truncate">
                  · {entry}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild className="h-auto w-full py-4 text-base">
            <Link href={`/d/${token}/play`}>Play it now →</Link>
          </Button>
          {isOwn ? (
            <Button asChild variant="secondary" className="h-auto w-full py-4 text-base">
              <Link href={`/${game.slug}/edit/${deck.id}`}>Edit your deck</Link>
            </Button>
          ) : (
            <CopyDeckButton token={token} signedIn={Boolean(user)} />
          )}
        </div>
      </Card>

      <p className="text-center text-sm text-zinc-500">
        No account needed to play it.{" "}
        <Link href="/" className="text-violet-300 hover:underline">
          See all 15 games
        </Link>
      </p>
    </PageContainer>
  );
}
