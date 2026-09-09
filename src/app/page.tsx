import Link from "next/link";
import Footer from "@/components/Footer";
import GameWall, { type WallRow, type WallTile } from "@/components/landing/GameWall";
import { ButtonLink } from "@/components/button-link";
import { GAMES, TOOLS, type GameSlug } from "@/lib/games";

const GAME_SLUGS = Object.keys(GAMES) as GameSlug[];
import { getGamePlayCounts, getShowcaseDecks, type ShowcaseDeck } from "@/lib/decks";

/** The order the wall falls back to while real play counts are still thin. */
const CURATED_MOST_PLAYED: GameSlug[] = [
  "charades", "truthordare", "neverhaveiever", "wouldyourather",
  "deeper", "wordspy", "flipside", "mostlikelyto",
];
const JUST_MET: GameSlug[] = [
  "wouldyourather", "fiveseconds", "oddoneout", "charades",
  "wordspy", "flipside", "wavelength", "doodlechain",
];
const KNOWN_FOR_YEARS: GameSlug[] = [
  "truthordare", "neverhaveiever", "paranoia", "deeper",
  "mostlikelyto", "fibber", "partymode", "boomit", "forbidden",
];

const LANGUAGE_LABEL: Record<string, string> = {
  fr: "En français",
  es: "En español",
  mk: "На македонски",
  de: "Auf Deutsch",
  it: "In italiano",
};

function gameTile(slug: GameSlug, decks: Map<string, ShowcaseDeck>): WallTile {
  const game = GAMES[slug];
  return {
    key: slug,
    slug,
    href: `/${slug}`,
    title: game.title,
    meta: `${game.minPlayers}–${game.maxPlayers} players · ~${game.minutes} min`,
    line: game.tagline,
    deck: decks.get(slug),
  };
}

export default async function Home() {
  const [showcase, counts] = await Promise.all([getShowcaseDecks(), getGamePlayCounts()]);
  const english = new Map(showcase.filter((d) => d.language === "en").map((d) => [d.gameType, d]));
  const foreign = showcase.filter((d) => d.language !== "en");

  // Real plays first; the curated order fills in behind them.
  const mostPlayed = [...CURATED_MOST_PLAYED]
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .slice(0, 8);

  const rows: WallRow[] = [
    {
      id: "most-played",
      title: "Most played",
      tiles: mostPlayed.map((s) => gameTile(s, english)),
      more: { href: "#all", label: "All seventeen" },
    },
    {
      id: "just-met",
      title: "You've just met",
      tiles: JUST_MET.map((s) => gameTile(s, english)),
    },
    {
      id: "known-for-years",
      title: "Known each other for years",
      tiles: KNOWN_FOR_YEARS.map((s) => gameTile(s, english)),
    },
    {
      id: "languages",
      title: "In your language",
      tiles: [
        ...foreign.map((d): WallTile => {
          const game = GAMES[d.gameType as GameSlug];
          return {
            key: d.id,
            slug: d.gameType,
            href: `/${d.gameType}/play/${d.id}`,
            title: d.name,
            meta: `${LANGUAGE_LABEL[d.language] ?? d.language} · ${game?.title ?? d.gameType}`,
            line: "A real deck, written for the people who get the jokes. Tap to play it.",
            deck: d,
          };
        }),
        {
          key: "make-yours",
          slug: "partymode",
          href: "/signup",
          title: "Make yours",
          meta: "Any game · any language",
          line: "Your city, your uni, your group chat. Build a deck, share it by QR.",
          deck: {
            id: "make-yours",
            name: "Your deck",
            gameType: "partymode",
            language: "en",
            entries: ["{player}, tell the group the story behind the group chat name"],
          },
        },
      ],
    },
    {
      id: "tools",
      title: "Quick tools",
      tiles: TOOLS.map((tool) => ({
        key: tool.slug,
        slug: tool.slug,
        href: tool.href,
        title: tool.title,
        meta: "No rules, no decks",
        line: tool.tagline,
      })),
    },
  ];

  return (
    <>
      <main className="pb-16">
        {/* Hook */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-8 sm:pt-10">
          <h1 className="hook max-w-4xl text-[2rem] font-extrabold leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            One phone on the table.{" "}
            <br className="hidden sm:block" />
            Seventeen games on it.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Break the ice with people you met an hour ago, or fill half an hour
            with people you&apos;ve known for years. Nothing to install, no
            account to play, and it keeps working when the wifi doesn&apos;t.
          </p>
          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/play" className="h-auto w-full px-6 py-3.5 text-base sm:w-auto">
              Start playing now
            </ButtonLink>
            <Link
              href="/tonight"
              className="text-sm font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              or plan the whole night
            </Link>
          </div>
        </section>

        {/* The wall */}
        <div id="games">
          <GameWall rows={rows} />
        </div>

        {/* Close */}
        <section id="all" className="mx-auto mt-16 w-full max-w-6xl scroll-mt-8 px-4 sm:mt-24 sm:px-6">
          <div className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            <Proof title="Plays without wifi">
              Open a game once and it keeps working with no connection — the
              part of the night when the venue&apos;s router gives up.
            </Proof>
            <Proof title="Remembers what you've seen">
              Every deck serves the cards this phone has not shown yet, so a
              second night is not the first night in a different order.
            </Proof>
            <Proof title="Yours to share">
              Any deck you build has a link and a QR code. Friends play it with
              no account and can keep their own copy.
            </Proof>
          </div>
          <div className="mt-14 border-t border-white/10 pt-10">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.08em] text-white sm:text-base">
              All seventeen
            </h2>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              {GAME_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/${slug}`}
                    className="text-base font-semibold text-zinc-200 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {GAMES[slug].title}
                  </Link>
                </li>
              ))}
              {TOOLS.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={tool.href}
                    className="text-base font-semibold text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ButtonLink href="/play" className="h-auto px-6 py-3.5 text-base">
                Start playing now
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Proof({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{children}</p>
    </div>
  );
}
