import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { getMyDecks } from "@/lib/decks";
import { GAME_SLUGS, GAMES, isGameSlug } from "@/lib/games";
import type { Deck } from "@/lib/schema";
import { TierBadge } from "@/components/TierBadge";
import { ButtonLink } from "@/components/button-link";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "My decks",
};

function entryCount(deck: Deck): number {
  return Object.values(deck.content).reduce(
    (sum, items) => sum + items.length,
    0,
  );
}

export default async function MyDecksPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const decks = await getMyDecks(user.id);
  const groups = GAME_SLUGS.map((slug) => ({
    game: GAMES[slug],
    decks: decks.filter((d) => d.gameType === slug),
  })).filter((g) => g.decks.length > 0);

  return (
    <PageContainer className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">My decks</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Everything you&apos;ve created, in one place.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-lg font-semibold">No decks yet 🎈</p>
          <p className="mt-1 text-sm text-zinc-400">
            Pick a game and build your first deck — it takes a minute.
          </p>
          <div className="mt-4">
            <ButtonLink href="/">Browse games</ButtonLink>
          </div>
        </Card>
      ) : (
        groups.map(({ game, decks: gameDecks }) => (
          <section key={game.slug} className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden>{game.emoji}</span>
              {game.title}
            </h2>
            <ul className="space-y-3">
              {gameDecks.map((deck) => (
                <li key={deck.id}>
                  <Card className="flex flex-row flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">
                          {deck.name}
                        </span>
                        <TierBadge tier={deck.tier} />
                        <span
                          className={
                            deck.isPublic
                              ? "shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300"
                              : "shrink-0 rounded-full bg-zinc-500/20 px-2 py-0.5 text-xs font-medium text-zinc-300"
                          }
                        >
                          {deck.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {entryCount(deck)} entries
                      </p>
                    </div>
                    {isGameSlug(deck.gameType) && (
                      <div className="flex items-center gap-3">
                        <ButtonLink
                          href={`/${deck.gameType}/play/${deck.id}`}
                          variant="secondary"
                          className="px-3 py-1.5"
                        >
                          Play
                        </ButtonLink>
                        <Link
                          href={`/${deck.gameType}/edit/${deck.id}`}
                          className="text-sm font-medium text-zinc-300 hover:text-white"
                        >
                          Edit
                        </Link>
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </PageContainer>
  );
}
