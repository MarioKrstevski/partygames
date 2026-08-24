import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createDeck } from "@/app/actions/decks";
import { getUser } from "@/lib/auth";
import { getGame } from "@/lib/games";
import DeckForm from "@/components/DeckForm";
import { PageContainer } from "@/components/ui";

interface NewDeckPageProps {
  params: Promise<{ game: string }>;
}

export async function generateMetadata({ params }: NewDeckPageProps): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return { title: `New ${game.title} deck — Party Games` };
}

export default async function NewDeckPage({ params }: NewDeckPageProps) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const user = await getUser();
  if (!user) redirect("/signin");

  const isAdmin = !!user.email && user.email === process.env.ADMIN_EMAIL;

  return (
    <PageContainer className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/${game.slug}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Back to {game.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          {game.emoji} New {game.title} deck
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Fill in your entries — one per line — and hit create.
        </p>
      </div>
      <DeckForm game={game} action={createDeck.bind(null, game.slug)} isAdmin={isAdmin} />
    </PageContainer>
  );
}
