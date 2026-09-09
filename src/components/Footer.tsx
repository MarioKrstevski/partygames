import Link from "next/link";
import { getUser } from "@/lib/auth";
import { GAMES, TOOLS } from "@/lib/games";

export default async function Footer() {
  const user = await getUser();
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              <span aria-hidden="true" className="inline-block size-2.5 rounded-[3px] bg-primary align-[-1px] shadow-[0_0_0_3px_oklch(0.55_0.24_295/35%)]" />
              <span className="ml-2">Party Games</span>
            </p>
            <p className="mt-1 text-sm text-zinc-400">Made for game nights.</p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Games
              </p>
              <ul className="mt-3 space-y-2">
                {Object.values(GAMES).map((game) => (
                  <li key={game.slug}>
                    <Link
                      href={`/${game.slug}`}
                      className="text-sm text-zinc-300 hover:text-white"
                    >
                      {game.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Tools
              </p>
              <ul className="mt-3 space-y-2">
                {TOOLS.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={tool.href}
                      className="text-sm text-zinc-300 hover:text-white"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Account
              </p>
              <ul className="mt-3 space-y-2">
                {user ? (
                  <li>
                    <Link
                      href="/decks"
                      className="text-sm text-zinc-300 hover:text-white"
                    >
                      My decks
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/signin"
                        className="text-sm text-zinc-300 hover:text-white"
                      >
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className="text-sm text-zinc-300 hover:text-white"
                      >
                        Create account
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
