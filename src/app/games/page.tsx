import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/layout";
import { ButtonLink } from "@/components/button-link";
import { GAMES, TOOLS, type GameSlug } from "@/lib/games";

export const metadata: Metadata = {
  title: "All games",
  description: "Every party game on one page. Pick one and play — nothing to install, no account needed.",
};

const GAME_SLUGS = Object.keys(GAMES) as GameSlug[];

export default function GamesPage() {
  return (
    <PageContainer className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">
            Pick a game
          </h1>
          <p className="mt-2 max-w-xl text-zinc-300">
            All of them play on this phone, right now. Not sure which? Let the
            night planner build a running order for you.
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/play" variant="secondary" className="h-auto px-4 py-2.5">
            Surprise me
          </ButtonLink>
          <ButtonLink href="/tonight" className="h-auto px-4 py-2.5">
            Plan tonight
          </ButtonLink>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_SLUGS.map((slug) => {
          const game = GAMES[slug];
          return (
            <li key={slug}>
              <Link
                href={`/${slug}`}
                className="group flex h-full gap-4 rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
              >
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/15 text-3xl">
                  {game.image ? (
                    <Image src={game.image} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <span aria-hidden="true">{game.emoji}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-white">{game.title}</h2>
                  <p className="mt-0.5 text-sm text-zinc-400">{game.tagline}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {game.minPlayers ?? 2}
                    {game.maxPlayers ? `–${game.maxPlayers}` : "+"} players · ~{game.minutes} min
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <section>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.08em] text-white sm:text-base">
          Quick tools
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={tool.href}
                className="flex h-full items-center gap-4 rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
              >
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                  {tool.emoji}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{tool.title}</h3>
                  <p className="mt-0.5 text-sm text-zinc-400">{tool.tagline}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}
