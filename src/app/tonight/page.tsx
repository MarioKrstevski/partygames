import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { getPlannableDecks } from "@/lib/decks";
import { PageContainer } from "@/components/layout";
import NightPlanner from "@/components/night/NightPlanner";
import type { PlannableDeck } from "@/lib/night";

export const metadata: Metadata = {
  title: "Plan tonight",
  description:
    "Tell us how many of you there are, what kind of night it is and how long you have got — we will build the running order.",
};

export default async function TonightPage() {
  const user = await getUser();
  const decks = await getPlannableDecks(user?.id);

  const plannable: PlannableDeck[] = decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    gameType: deck.gameType,
    tier: deck.tier,
  }));

  return (
    <PageContainer className="max-w-xl space-y-6">
      <header className="space-y-2">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          ← All games
        </Link>
        <h1 className="text-3xl font-bold sm:text-4xl">
          <span aria-hidden>🌙</span> Plan tonight
        </h1>
        <p className="text-zinc-300">
          Nobody wants to scroll a menu at 11pm. Answer three questions and get
          a running order — the right games for your group size, paced so you
          are not shouting for two hours straight, warming up before it gets
          personal.
        </p>
      </header>

      <NightPlanner decks={plannable} />
    </PageContainer>
  );
}
