"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink, Card, PageContainer } from "@/components/ui";
import { shuffleArray, vibrate } from "@/lib/utils";
import { pickPair, type Player } from "@/lib/players";
import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";

const QUESTIONS: string[] = [
  // Wholesome
  "Who here would survive longest in a zombie apocalypse?",
  "Who would you call first if you won the lottery?",
  "Who here gives the best hugs?",
  "Who would you trust to plan your entire birthday?",
  "Who here is secretly the most talented person in the room?",
  "Who would make the best parent one day?",
  "Who would you want next to you on a deserted island?",
  "Who here always knows how to cheer you up?",
  "Who would you trust with your phone unlocked for a whole day?",
  "Who here is most likely to become famous?",
  "Who would you pick as your partner in a two-person heist?",
  "Who here would you want as your lawyer if you got arrested?",
  "Who is most likely to drop everything and help you at 3 a.m.?",
  // Funny
  "Who here would accidentally start a cult?",
  "Who is most likely to get kicked out of a library for laughing?",
  "Who would eat something off the floor without hesitation?",
  "Who here would lose a fight against a goose?",
  "Who is most likely to reply to a scam email?",
  "Who would show up to their own wedding late?",
  "Who here has definitely stalked their crush's ex online?",
  "Who is most likely to cry during a commercial?",
  "Who would survive exactly zero minutes in a horror movie?",
  "Who here talks to themselves the most?",
  "Who is most likely to get famous for something embarrassing?",
  "Who would spend their last 20 euros on something completely useless?",
  "Who here is most likely to trip while walking on flat ground?",
  "Who would win a lying competition without even trying?",
  // Flirty (cheeky, not explicit)
  "Who is most likely to have a secret crush in this room?",
  "Who here has the most kissable smile?",
  "Who would you pick for a slow dance if you had to choose right now?",
  "Who here could steal someone's partner with one look?",
  "Who would be the best date to bring home to your parents?",
  "Who here is the biggest flirt when they've had one drink?",
  "Who would you text first if you were bored at midnight?",
  "Who here smells the best?",
  "Who is most likely to fall in love with someone in this room?",
  "Who would you choose for a fake wedding if you had to marry tonight?",
  "Who here gets away with everything because they're cute?",
  "Who would be the hardest to say no to?",
  "Who here is someone's celebrity crush in disguise?",
];

type Phase =
  | "start"
  | "handoff"
  | "whisper"
  | "aloud"
  | "flipping"
  | "result"
  | "finished";

export default function ParanoiaGame() {
  const { roster, update, ready } = usePlayers();

  const [phase, setPhase] = useState<Phase>("start");
  const [deck, setDeck] = useState<string[]>([]);
  const [deckPos, setDeckPos] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [pair, setPair] = useState<{ asker: Player; target: Player } | null>(
    null,
  );
  const [heads, setHeads] = useState(false);

  const enoughPlayers = roster.players.length >= 3;
  const question = deck[deckPos];

  useEffect(() => {
    if (phase !== "flipping") return;
    const timer = setTimeout(() => {
      vibrate(heads ? [80, 60, 80] : 200);
      setPhase("result");
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase, heads]);

  function beginRound(nextTurnIndex: number) {
    const nextPair = pickPair(roster, nextTurnIndex);
    if (!nextPair) return;
    setPair(nextPair);
    setTurnIndex(nextTurnIndex);
    setPhase("handoff");
  }

  function startGame() {
    setDeck(shuffleArray(QUESTIONS));
    setDeckPos(0);
    beginRound(0);
  }

  function flipCoin() {
    setHeads(Math.random() < 0.5);
    setPhase("flipping");
  }

  function nextRound() {
    if (deckPos + 1 >= deck.length) {
      setPhase("finished");
      return;
    }
    setDeckPos(deckPos + 1);
    beginRound(turnIndex + 1);
  }

  return (
    <PageContainer className="max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <ButtonLink href="/lab" variant="ghost">
          ← Lab
        </ButtonLink>
        <span className="rounded-full border border-violet-400/40 bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-200">
          🧪 Lab preview
        </span>
      </div>

      <h1 className="mb-1 text-3xl font-bold">🤫 Paranoia</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Whisper a question, answer out loud, flip a coin. Heads reveals the
        question — tails keeps everyone guessing.
      </p>

      {!ready ? (
        <Card>
          <p className="text-center text-sm text-zinc-400">Loading…</p>
        </Card>
      ) : !enoughPlayers ? (
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-zinc-300">
              Paranoia needs at least <strong>3 players</strong> — one asks,
              one answers, and the rest sweat over what the question was. Add{" "}
              {3 - roster.players.length} more player
              {3 - roster.players.length === 1 ? "" : "s"} below to start.
            </p>
          </Card>
          <PlayerSetup roster={roster} onChange={update} showModes />
        </div>
      ) : phase === "start" ? (
        <div className="space-y-4">
          <PlayerSetup roster={roster} onChange={update} showModes />
          <Button className="w-full py-4 text-base" onClick={startGame}>
            Start game
          </Button>
        </div>
      ) : phase === "finished" ? (
        <Card className="space-y-5 text-center">
          <p className="text-4xl">🏁</p>
          <h2 className="text-xl font-semibold">Deck exhausted!</h2>
          <p className="text-sm text-zinc-400">
            You made it through all {deck.length} questions. The secrets you
            keep are your own problem now.
          </p>
          <Button className="w-full py-4 text-base" onClick={startGame}>
            🔀 Reshuffle & play again
          </Button>
        </Card>
      ) : pair ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              Round {deckPos + 1} / {deck.length}
            </span>
            <span>
              {roster.settings.pairMode === "boysvsgirls"
                ? "💘 boys vs girls"
                : "🎲 random"}
            </span>
          </div>

          {phase === "handoff" && (
            <Card className="space-y-6 py-10 text-center">
              <p className="text-4xl">📱</p>
              <h2 className="text-xl font-semibold">
                Pass the phone to{" "}
                <span className="text-violet-300">{pair.asker.name}</span>
              </h2>
              <p className="text-sm text-zinc-400">
                Nobody else peek — the next screen is for their eyes only.
              </p>
              <Button
                className="w-full py-4 text-base"
                onClick={() => setPhase("whisper")}
              >
                I&apos;m {pair.asker.name} — ready
              </Button>
            </Card>
          )}

          {phase === "whisper" && (
            <Card className="space-y-6 py-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
                Your secret question
              </p>
              <p className="text-2xl font-bold leading-snug">{question}</p>
              <p className="text-sm text-zinc-400">
                🤫 Whisper this to{" "}
                <span className="font-semibold text-white">
                  {pair.target.name}
                </span>{" "}
                so nobody else hears.
              </p>
              <Button
                className="w-full py-4 text-base"
                onClick={() => setPhase("aloud")}
              >
                Done whispering
              </Button>
            </Card>
          )}

          {phase === "aloud" && (
            <Card className="space-y-6 py-10 text-center">
              <p className="text-4xl">📢</p>
              <h2 className="text-xl font-semibold">
                <span className="text-violet-300">{pair.target.name}</span>:
                say your answer out loud — just a name!
              </h2>
              <p className="text-sm text-zinc-400">
                Then flip the coin. Heads and everyone hears the question…
              </p>
              <Button className="w-full py-4 text-base" onClick={flipCoin}>
                🪙 Flip the coin
              </Button>
            </Card>
          )}

          {phase === "flipping" && (
            <Card className="space-y-6 py-14 text-center" aria-live="polite">
              <p className="animate-spin text-6xl" aria-hidden="true">
                🪙
              </p>
              <p className="text-lg font-semibold text-zinc-300">
                The coin is in the air…
              </p>
            </Card>
          )}

          {phase === "result" && (
            <Card className="space-y-6 py-8 text-center" aria-live="polite">
              {heads ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
                    Heads — question revealed!
                  </p>
                  <p className="text-3xl font-bold leading-snug">{question}</p>
                  <p className="text-sm text-zinc-400">
                    Everyone now knows why{" "}
                    <span className="font-semibold text-white">
                      {pair.target.name}
                    </span>{" "}
                    said that name.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-4xl">🤐</p>
                  <h2 className="text-2xl font-bold">
                    Tails — the question stays secret
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Enjoy the paranoia. Only{" "}
                    <span className="font-semibold text-white">
                      {pair.asker.name}
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-white">
                      {pair.target.name}
                    </span>{" "}
                    will ever know.
                  </p>
                </>
              )}
              <Button className="w-full py-4 text-base" onClick={nextRound}>
                {deckPos + 1 >= deck.length ? "Finish game" : "Next round →"}
              </Button>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <p className="text-center text-sm text-zinc-400">
            Couldn&apos;t pick a pair — check your player list.
          </p>
        </Card>
      )}
    </PageContainer>
  );
}
