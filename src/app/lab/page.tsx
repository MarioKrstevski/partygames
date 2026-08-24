import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Card, PageContainer } from "@/components/ui";
import LabRoster from "./LabRoster";

export const metadata: Metadata = {
  title: "Lab — new games preview",
  description:
    "Experimental party games we're testing before they hit the main app. Play them, break them, tell us what's fun.",
};

const GAMES = [
  {
    href: "/lab/wouldyourather",
    emoji: "🤷",
    name: "Would You Rather",
    tagline: "Impossible choices, zero mercy.",
    players: "No players needed — just pass the phone",
  },
  {
    href: "/lab/paranoia",
    emoji: "🤫",
    name: "Paranoia",
    tagline: "Whisper, answer, pray the coin stays down.",
    players: "3+ players",
  },
  {
    href: "/lab/wordspy",
    emoji: "🕵️",
    name: "Word Spy",
    tagline: "Everyone knows the word, one of you is lying.",
    players: "3+ players",
  },
] as const;

export default function LabPage() {
  return (
    <PageContainer className="max-w-2xl space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Home
          </Link>
          <span className="rounded-full border border-violet-500/40 bg-violet-600/20 px-3 py-1 text-xs font-semibold text-violet-300">
            🧪 Lab preview
          </span>
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">🧪 The Lab</h1>
        <p className="text-zinc-400">
          Experimental games we&apos;re still testing — rough edges included.
          Play them with your group and tell us what&apos;s fun and what flops.
          Feedback welcome!
        </p>
        <p className="text-sm text-zinc-500">
          Set up your players once below and every lab game uses them. Players
          are saved on this phone only — nothing leaves your device.
        </p>
      </header>

      <section aria-label="Player roster">
        <LabRoster />
      </section>

      <section aria-label="Lab games" className="space-y-4">
        <h2 className="text-lg font-semibold">Games in testing</h2>
        {GAMES.map((game) => (
          <Card key={game.href} className="flex items-center gap-4">
            <span aria-hidden="true" className="text-3xl">
              {game.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{game.name}</h3>
              <p className="text-sm text-zinc-400">{game.tagline}</p>
              <p className="mt-1 text-xs text-zinc-500">{game.players}</p>
            </div>
            <ButtonLink href={game.href} className="shrink-0">
              Play
            </ButtonLink>
          </Card>
        ))}
      </section>
    </PageContainer>
  );
}
