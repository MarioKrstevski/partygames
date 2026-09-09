import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import PhoneFrame from "@/components/landing/PhoneFrame";
import { ButtonLink } from "@/components/button-link";
import { GAMES, TOOLS, type GameSlug } from "@/lib/games";
import { getShowcaseDecks } from "@/lib/decks";

const GAME_SLUGS = Object.keys(GAMES) as GameSlug[];

/** The three games shown in the hero: the ones people reach for first. */
const HERO_GAMES: GameSlug[] = ["charades", "wouldyourather", "neverhaveiever"];

const LANGUAGE_LABEL: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

export default async function Home() {
  const showcase = await getShowcaseDecks();
  const english = new Map(showcase.filter((d) => d.language === "en").map((d) => [d.gameType, d]));
  const charadesIn = ["en", "fr", "es"]
    .map((lang) => showcase.find((d) => d.gameType === "charades" && d.language === lang))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <>
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:pb-24 lg:pt-20">
          <div>
            <h1 className="hook text-[2.25rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.4rem]">
              You don&apos;t need five apps and a subscription to play with your friends.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-300">
              Seventeen party games in one browser tab, on one phone. Open the
              page, pass the phone around. Nothing to install, no account to
              play, and it keeps working when the wifi doesn&apos;t.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/play" className="h-auto w-full px-6 py-3.5 text-base sm:w-auto">
                Start playing now
              </ButtonLink>
              <ButtonLink href="/tonight" variant="secondary" className="h-auto w-full px-6 py-3.5 text-base sm:w-auto">
                Plan tonight
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Free. No sign-up to play. Accounts only for building your own decks.
            </p>
          </div>

          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] -mx-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:items-end sm:overflow-visible sm:px-0 sm:pb-0 lg:pl-4">
            {HERO_GAMES.map((slug, i) => (
              <PhoneFrame
                key={slug}
                slug={slug}
                deck={english.get(slug)}
                depth={(i + 1) as 1 | 2 | 3}
                drift
                caption={GAMES[slug].title}
                className={i === 1 ? "sm:-translate-y-10" : ""}
              />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-white/10">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <h2 className="hook max-w-3xl text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">
              Everything a game night needs, in one tab.
            </h2>
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              <Feature icon={<IconStack />} title="Seventeen games, not seventeen apps">
                Charades, Truth or Dare, Never Have I Ever, Would You Rather,
                Word Spy, Deeper and eleven more — every classic on one page.
              </Feature>
              <Feature icon={<IconEdit />} title="Make every deck yours">
                Edit the built-in decks or write your own from scratch: inside
                jokes, your city, your university, your group chat.
              </Feature>
              <Feature icon={<IconShare />} title="Invite players with a link or QR">
                Every deck has a share link and a QR code. Friends play it with
                no account, and can keep their own copy.
              </Feature>
              <Feature icon={<IconOffline />} title="Plays without wifi">
                Open a game once and it keeps working with no connection — for
                the part of the night when the venue&apos;s router gives up.
              </Feature>
              <Feature icon={<IconMemory />} title="Remembers what you've seen">
                Decks serve the cards this phone hasn&apos;t shown yet, so the
                second night isn&apos;t the first night in a different order.
              </Feature>
              <Feature icon={<IconClock />} title="Plans the whole night">
                Tell it how many people, the vibe and how long you have; it
                builds a running order that warms up and escalates.
              </Feature>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className="border-t border-white/10">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-24">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] -mx-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:items-end sm:overflow-visible sm:px-0 sm:pb-0">
              {charadesIn.map((deck, i) => (
                <PhoneFrame
                  key={deck.id}
                  slug="charades"
                  deck={deck}
                  depth={(i + 1) as 1 | 2 | 3}
                  caption={`${LANGUAGE_LABEL[deck.language] ?? deck.language} · ${deck.name}`}
                />
              ))}
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">
                Same game, your language.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-300">
                The built-in decks are the starting point. Charades ships in
                English, French and Spanish today, and any deck you write can
                be in any language — the jokes only your group gets.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-zinc-300">
                Build a deck for your flat, your course, your team. Share it
                with a link or a QR code and everyone at the table is in.
              </p>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="/signup" className="h-auto px-6 py-3.5 text-base">
                  Make your own deck
                </ButtonLink>
                {charadesIn[1] && (
                  <Link
                    href={`/charades/play/${charadesIn[1].id}`}
                    className="text-sm font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    Try the French deck
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* All games */}
        <section className="border-t border-white/10">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
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
          </div>
        </section>

        {/* Closing call */}
        <section className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
            <div>
              <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">
                Ready when the group is.
              </h2>
              <p className="mt-3 text-lg text-zinc-300">
                One tap drops you into a game. No download, no sign-up.
              </p>
            </div>
            <ButtonLink href="/play" className="h-auto px-7 py-4 text-base">
              Start playing now
            </ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-violet-300">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{children}</p>
      </div>
    </div>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  className: "h-5 w-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function IconStack() {
  return (
    <svg {...iconProps}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg {...iconProps}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m13.5 6.5 3 3" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h3v3M20 14v6h-6" />
    </svg>
  );
}
function IconOffline() {
  return (
    <svg {...iconProps}>
      <path d="M5 12.5a10 10 0 0 1 14 0" />
      <path d="M8.5 16a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19.5" r="0.75" fill="currentColor" />
      <path d="m3 3 18 18" />
    </svg>
  );
}
function IconMemory() {
  return (
    <svg {...iconProps}>
      <path d="M12 8v4l2.5 2.5" />
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
      <path d="M3 3v4h4" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h3M13 14h3M8 17h3" />
    </svg>
  );
}
