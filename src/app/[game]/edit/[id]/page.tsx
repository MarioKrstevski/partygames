import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { deleteDeck, updateDeck } from "@/app/actions/decks";
import { getUser, isAdminEmail } from "@/lib/auth";
import { getOwnedDeck } from "@/lib/decks";
import { getGame } from "@/lib/games";
import DeckForm from "@/components/DeckForm";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/ui/card";
import DeleteDeckButton from "./DeleteDeckButton";

interface EditDeckPageProps {
  params: Promise<{ game: string; id: string }>;
}

export async function generateMetadata({ params }: EditDeckPageProps): Promise<Metadata> {
  const { game: slug, id } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return { title: `Edit ${game.title} deck` };
}

export default async function EditDeckPage({ params }: EditDeckPageProps) {
  const { game: slug, id } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const user = await getUser();
  if (!user) redirect("/signin");

  const isAdmin = isAdminEmail(user.email);

  const deck = await getOwnedDeck(id, user.id);
  if (!deck || deck.gameType !== game.slug) notFound();

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
          {game.emoji} Edit deck
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tweak your entries — one per line — and save.
        </p>
      </div>

      <DeckForm
        game={game}
        action={updateDeck.bind(null, game.slug, deck.id)}
        initial={{
          name: deck.name,
          description: deck.description ?? "",
          language: deck.language,
          isPublic: deck.isPublic,
          content: deck.content,
        }}
        isAdmin={isAdmin}
      />

      <Card className="border-red-500/20 p-5">
        <h2 className="text-sm font-semibold text-red-300">Danger zone</h2>
        <p className="mb-3 mt-1 text-sm text-zinc-400">
          Deleting a deck removes it for everyone, permanently.
        </p>
        <DeleteDeckButton
          deckName={deck.name}
          action={deleteDeck.bind(null, game.slug, deck.id)}
        />
      </Card>
    </PageContainer>
  );
}
