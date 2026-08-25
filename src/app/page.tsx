import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { GAMES, TOOLS } from "@/lib/games";
import { ButtonLink } from "@/components/button-link";

const STEPS = [
  {
    title: "Create a free account",
    description:
      "One minute, no credit card. Playing stays free with or without one.",
  },
  {
    title: "Build a deck in your language",
    description:
      "Charades words, dares, punishments — write them yourself. Your inside jokes, your language, your people.",
  },
  {
    title: "Host game night",
    description:
      "Open a game, pick your deck, pass the phone around. That is the whole setup.",
  },
] as const;

export default function Home() {
  return (
    <>
      <main>
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-24">
          <p
            aria-hidden="true"
            className="mb-6 text-3xl tracking-widest sm:text-4xl"
          >
            🎭 🔥 👉 ⏱️ 🙈 💣 🤷 🤫 🕵️ 🐮 🤥 🎉 🎨
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            One phone. Every party game.{" "}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Zero excuses.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
            Charades, Truth or Dare, Never Have I Ever and more — playable in
            the browser the second your friends walk in. No app to install, no
            account needed to play. Want it personal? Build custom decks in any
            language.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="#games" className="h-auto w-full px-6 py-3 text-base sm:w-auto">
              Pick a game
            </ButtonLink>
            <ButtonLink
              href="/signup"
              variant="secondary"
              className="h-auto w-full px-6 py-3 text-base sm:w-auto"
            >
              Create a deck
            </ButtonLink>
          </div>
        </section>

        {/* Games grid */}
        <section
          id="games"
          aria-labelledby="games-heading"
          className="mx-auto w-full max-w-5xl scroll-mt-8 px-4 sm:px-6"
        >
          <h2
            id="games-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Pick your poison
          </h2>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Thirteen games, all free, all ready in one tap.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(GAMES).map((game) => (
              <li key={game.slug}>
                <Link
                  href={`/${game.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-colors hover:border-violet-400/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/30">
                    {game.image ? (
                      <Image
                        src={game.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/40 via-violet-900/30 to-pink-500/20 text-6xl transition-transform duration-300 group-hover:scale-110"
                      >
                        {game.emoji}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-lg font-semibold text-white">
                      <span aria-hidden="true" className="mr-2">
                        {game.emoji}
                      </span>
                      {game.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">{game.tagline}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick tools */}
        <section
          aria-labelledby="tools-heading"
          className="mx-auto mt-16 w-full max-w-5xl px-4 sm:px-6"
        >
          <h2
            id="tools-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Quick tools
          </h2>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            No rules, no decks — just the classics when you need them.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={tool.href}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:border-violet-400/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-3xl"
                  >
                    {tool.emoji}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold text-white">
                      {tool.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-400">
                      {tool.tagline}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Make it yours */}
        <section
          aria-labelledby="custom-heading"
          className="mx-auto my-16 w-full max-w-5xl px-4 sm:my-24 sm:px-6"
        >
          <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-600/15 to-pink-500/5 p-6 sm:p-10">
            <h2
              id="custom-heading"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Make it yours
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-300 sm:text-base">
              The built-in decks are great. The deck full of things only your
              group would dare each other to do? Better.
            </p>
            <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex flex-col">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
            <ButtonLink href="/signup" className="mt-8 h-auto px-6 py-3 text-base">
              Start building decks
            </ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
