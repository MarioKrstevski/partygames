import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { getVisibleDecks } from "@/lib/decks";
import { getGame } from "@/lib/games";
import type { Deck } from "@/lib/schema";
import { TierBadge } from "@/components/TierBadge";
import { ButtonLink } from "@/components/button-link";
import { PageContainer } from "@/components/layout";
import SavedToast from "@/components/SavedToast";
import { Card } from "@/components/ui/card";

interface GamePageProps {
  params: Promise<{ game: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: game.title,
    description: game.description,
  };
}

function entryCount(deck: Deck): number {
  return Object.values(deck.content).reduce(
    (sum, items) => sum + items.length,
    0,
  );
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  mk: "Македонски",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

export default async function GamePage({ params }: GamePageProps) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const user = await getUser();
  const decks = await getVisibleDecks(game.slug, user?.id);

  return (
    <PageContainer className="space-y-8">
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
      <Card className="space-y-4 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span aria-hidden className="text-5xl">
            {game.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{game.title}</h1>
            <p className="text-zinc-300">{game.tagline}</p>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-300">
            How to play
          </h2>
          <ol className="space-y-1.5 text-sm text-zinc-300">
            {game.howToPlay.map((step, i) => (
              <li key={step} className="flex gap-2.5">
                <span className="font-semibold text-violet-400">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Decks</h2>
          {user ? (
            <ButtonLink href={`/${game.slug}/new`} variant="secondary">
              Create your own deck
            </ButtonLink>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">
                Sign in to create your own deck
              </span>
              <ButtonLink href="/signin" variant="secondary">
                Sign in
              </ButtonLink>
            </div>
          )}
        </div>

        {decks.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-lg font-semibold">No decks here yet 🫗</p>
            <p className="mt-1 text-sm text-zinc-400">
              Be the first to bring the party — create a {game.title} deck and
              share it.
            </p>
            <div className="mt-4">
              <ButtonLink href={user ? `/${game.slug}/new` : "/signin"}>
                {user ? "Create a deck" : "Sign in to create one"}
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {decks.map((deck) => (
              <li key={deck.id}>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{deck.name}</h3>
                      <TierBadge tier={deck.tier} />
                    </div>
                    <span
                      className={
                        deck.isPublic
                          ? "shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300"
                          : "shrink-0 rounded-full bg-zinc-500/20 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
                      }
                    >
                      {deck.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  {deck.description && (
                    <p className="text-sm text-zinc-400">{deck.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 font-medium text-violet-300">
                      {LANGUAGE_LABELS[deck.language] ?? deck.language}
                    </span>
                    <span>{entryCount(deck)} entries</span>
                  </div>
                  <div className="mt-auto flex items-center gap-3 pt-1">
                    <ButtonLink href={`/${game.slug}/play/${deck.id}`}>
                      Play
                    </ButtonLink>
                    {user?.id === deck.userId && (
                      <Link
                        href={`/${game.slug}/edit/${deck.id}`}
                        className="text-sm font-medium text-zinc-300 hover:text-white"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageContainer>
  );
}
