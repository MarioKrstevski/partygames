"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlayers } from "@/components/players/usePlayers";
import { Button, PageContainer } from "@/components/ui";
import { cn, shuffleArray, vibrate } from "@/lib/utils";

interface Dilemma {
  a: string;
  b: string;
}

const DECK: Dilemma[] = [
  { a: "never taste food again", b: "never hear music again" },
  { a: "always say exactly what you're thinking", b: "never speak again" },
  {
    a: "have your search history projected at every party",
    b: "have your group chats read aloud at family dinners",
  },
  { a: "fight one horse-sized duck", b: "fight a hundred duck-sized horses" },
  { a: "be famous but broke", b: "be rich but completely unknown" },
  {
    a: "sneeze glitter for the rest of your life",
    b: "hiccup confetti every time you laugh",
  },
  { a: "know how you die", b: "know when you die" },
  {
    a: "only be able to whisper",
    b: "only be able to shout",
  },
  {
    a: "relive the same great day forever",
    b: "live a new random day every day",
  },
  {
    a: "have hands for feet",
    b: "have feet for hands",
  },
  {
    a: "give up cheese forever",
    b: "give up chocolate forever",
  },
  {
    a: "always be 10 minutes late",
    b: "always be 2 hours early",
  },
  {
    a: "be able to talk to animals",
    b: "speak every human language fluently",
  },
  {
    a: "lose all your photos",
    b: "lose all your messages",
  },
  {
    a: "have a rewind button for your life",
    b: "have a pause button for your life",
  },
  {
    a: "dance every time you hear any music",
    b: "sing along to every song you know",
  },
  {
    a: "shower with your clothes on forever",
    b: "sleep in wet socks every night",
  },
  {
    a: "read minds but can't turn it off",
    b: "be invisible but only when nobody's looking",
  },
  {
    a: "drink everything through your nose",
    b: "eat everything with your elbows glued to your sides",
  },
  {
    a: "text your crush your most embarrassing secret",
    b: "call your boss at 3 a.m. by accident every week",
  },
  {
    a: "live without the internet",
    b: "live without air conditioning and heating",
  },
  {
    a: "always have a song stuck in your head",
    b: "always have a word on the tip of your tongue",
  },
  {
    a: "smell like wet dog when it rains",
    b: "sound like a kazoo when you cry",
  },
  {
    a: "have unlimited free flights",
    b: "never pay for food at restaurants again",
  },
  {
    a: "be the funniest person in the room",
    b: "be the smartest person in the room",
  },
  {
    a: "wake up as a different person every day",
    b: "wake up in a different country every day",
  },
  {
    a: "only eat your favorite meal forever",
    b: "never eat your favorite meal again",
  },
  {
    a: "have a personal theme song that plays when you enter a room",
    b: "have dramatic slow-motion every time you leave one",
  },
  {
    a: "forget who you are every night",
    b: "remember every single thing forever",
  },
  {
    a: "burp bubbles",
    b: "fart fog",
  },
  {
    a: "win an argument with the wrong facts",
    b: "lose an argument while being right",
  },
  {
    a: "have your first name be a warning label",
    b: "have your last name be a sound effect",
  },
  {
    a: "be stuck in an elevator with your ex",
    b: "be stuck at an airport with your in-laws",
  },
  {
    a: "always know when someone is lying",
    b: "always get away with lying",
  },
  {
    a: "swap lives with your pet for a week",
    b: "swap lives with your best friend for a year",
  },
  {
    a: "only watch movies you've already seen",
    b: "only listen to songs released this year",
  },
  {
    a: "high-five everyone you make eye contact with",
    b: "wink at everyone who says your name",
  },
  {
    a: "have free coffee for life",
    b: "never need sleep on weekends",
  },
  {
    a: "accidentally like a 5-year-old photo while stalking",
    b: "send a screenshot of the chat to the chat",
  },
  {
    a: "age only from the neck up",
    b: "age only from the neck down",
  },
];

const FLAVOR_LINES = [
  "Bold choice!",
  "No hesitation. Respect.",
  "The group demands an explanation.",
  "Someone's sleeping easy tonight.",
  "Spicy. Very spicy.",
  "That answer says a lot about you.",
  "Zero regrets, apparently.",
  "Interesting… very interesting.",
  "The debate starts now.",
  "Living dangerously, we see.",
];

type Phase = "start" | "playing" | "done";

export default function WouldYouRatherGame() {
  const { roster, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("start");
  const [deck, setDeck] = useState<Dilemma[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [flavor, setFlavor] = useState("");
  const [turn, setTurn] = useState(0);

  const players = ready ? roster.players : [];
  const chooser =
    players.length >= 2 ? players[turn % players.length] : null;

  function startGame() {
    setDeck(shuffleArray(DECK));
    setIndex(0);
    setPicked(null);
    setTurn(0);
    setPhase("playing");
  }

  function choose(side: "a" | "b") {
    if (picked) return;
    vibrate(30);
    setPicked(side);
    setFlavor(FLAVOR_LINES[Math.floor(Math.random() * FLAVOR_LINES.length)]);
  }

  function next() {
    if (index + 1 >= deck.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setTurn((t) => t + 1);
    setPicked(null);
  }

  const dilemma = deck[index];

  return (
    <PageContainer className="flex min-h-dvh max-w-2xl flex-col">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/lab"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          ← Lab
        </Link>
        <span className="rounded-full border border-violet-500/40 bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-200">
          🧪 Lab preview
        </span>
      </header>

      {phase === "start" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="text-6xl" aria-hidden>
            🤔
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Would You Rather</h1>
            <p className="mt-2 max-w-sm text-zinc-400">
              {DECK.length} impossible choices. Tap your pick, defend it to the
              group, then pass the phone.
            </p>
          </div>
          <Button
            onClick={startGame}
            className="w-full max-w-xs px-8 py-4 text-lg"
          >
            Start
          </Button>
          {ready && players.length < 2 && (
            <Link
              href="/lab"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Add players →
            </Link>
          )}
          {chooser && (
            <p className="text-sm text-zinc-500">
              Playing with {players.length} players — {players[0].name} goes
              first.
            </p>
          )}
        </div>
      )}

      {phase === "playing" && dilemma && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span aria-live="polite">
              {chooser ? (
                <>
                  It&apos;s{" "}
                  <span className="font-semibold text-violet-300">
                    {chooser.name}
                  </span>
                  &apos;s call
                </>
              ) : (
                "Group vote"
              )}
            </span>
            <span>
              {index + 1}/{deck.length}
            </span>
          </div>

          <h2 className="text-center text-2xl font-bold text-white">
            Would you rather…
          </h2>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {(["a", "b"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => choose(side)}
                disabled={picked !== null && picked !== side}
                className={cn(
                  "flex min-h-36 flex-1 items-center justify-center rounded-2xl border p-6 text-center text-xl font-semibold leading-snug transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 sm:min-h-64",
                  picked === side
                    ? "scale-[1.02] border-violet-400 bg-violet-600/40 text-white shadow-lg shadow-violet-600/30"
                    : picked
                      ? "border-white/5 bg-white/[0.03] text-zinc-600"
                      : "border-white/10 bg-white/5 text-zinc-100 hover:border-violet-400/50 hover:bg-white/10 active:scale-[0.99]",
                )}
              >
                {dilemma[side]}
              </button>
            ))}
          </div>

          <div className="flex min-h-20 flex-col items-center justify-center gap-3 pb-2">
            {picked ? (
              <>
                <p
                  className="text-base font-medium text-violet-300"
                  aria-live="polite"
                >
                  {flavor}
                </p>
                <Button onClick={next} className="w-full max-w-xs py-3.5 text-base">
                  {index + 1 >= deck.length ? "Finish" : "Next →"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                Tap the option you&apos;d rather live with.
              </p>
            )}
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="text-6xl" aria-hidden>
            🎉
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Deck complete!</h2>
            <p className="mt-2 text-zinc-400">
              {deck.length} dilemmas survived. Friendships… maybe.
            </p>
          </div>
          <Button
            onClick={startGame}
            className="w-full max-w-xs px-8 py-4 text-lg"
          >
            Play again
          </Button>
          <Link
            href="/lab"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Back to Lab
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
