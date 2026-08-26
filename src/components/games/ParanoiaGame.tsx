"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";
import { shuffleArray, vibrate } from "@/lib/utils";
import { shuffleFresh } from "@/lib/freshness";
import { useSeen } from "@/lib/use-seen";
import { pickPair, type Player } from "@/lib/players";
import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";

type Phase =
  | "start"
  | "handoff"
  | "whisper"
  | "aloud"
  | "flipping"
  | "result"
  | "finished";

type ParanoiaGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function ParanoiaGame({ deck }: ParanoiaGameProps) {
  const { roster, update, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("start");
  const [questions, setQuestions] = useState<string[]>([]);
  const [deckPos, setDeckPos] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [pair, setPair] = useState<{ asker: Player; target: Player } | null>(
    null,
  );
  const [heads, setHeads] = useState(false);

  const allQuestions = deck.content.questions ?? [];
  const enoughPlayers = roster.players.length >= 3;
  const question = questions[deckPos];
  useSeen(deck.id, question);

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
    setQuestions(shuffleFresh(allQuestions, deck.id));
    setDeckPos(0);
    beginRound(0);
  }

  function flipCoin() {
    setHeads(Math.random() < 0.5);
    setPhase("flipping");
  }

  function nextRound() {
    if (deckPos + 1 >= questions.length) {
      setPhase("finished");
      return;
    }
    setDeckPos(deckPos + 1);
    beginRound(turnIndex + 1);
  }

  return (
    <PageContainer className="max-w-xl">
      <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
        <span className="truncate font-medium">{deck.name}</span>
        <Link href="/paranoia" className="transition-colors hover:text-white">
          Exit
        </Link>
      </div>

      <h1 className="mb-1 text-3xl font-bold">🤫 Paranoia</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Whisper a question, answer out loud, flip a coin. Heads reveals the
        question — tails keeps everyone guessing.
      </p>

      {!ready ? (
        <Card className="p-5">
          <p className="text-center text-sm text-zinc-400">Loading…</p>
        </Card>
      ) : !enoughPlayers ? (
        <div className="space-y-4">
          <Card className="p-5">
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
          <Button className="h-auto w-full py-4 text-base" onClick={startGame}>
            Start game
          </Button>
        </div>
      ) : phase === "finished" ? (
        <Card className="space-y-5 p-5 text-center">
          <p className="text-4xl">🏁</p>
          <h2 className="text-xl font-semibold">Deck exhausted!</h2>
          <p className="text-sm text-zinc-400">
            You made it through all {questions.length} questions. The secrets
            you keep are your own problem now.
          </p>
          <Button className="h-auto w-full py-4 text-base" onClick={startGame}>
            🔀 Reshuffle & play again
          </Button>
        </Card>
      ) : pair ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              Round {deckPos + 1} / {questions.length}
            </span>
            <span>
              {roster.settings.pairMode === "boysvsgirls"
                ? "💘 boys vs girls"
                : "🎲 random"}
            </span>
          </div>

          {phase === "handoff" && (
            <Card className="space-y-6 p-5 py-10 text-center">
              <p className="text-4xl">📱</p>
              <h2 className="text-xl font-semibold">
                Pass the phone to{" "}
                <span className="text-violet-300">{pair.asker.name}</span>
              </h2>
              <p className="text-sm text-zinc-400">
                Nobody else peek — the next screen is for their eyes only.
              </p>
              <Button
                className="h-auto w-full py-4 text-base"
                onClick={() => setPhase("whisper")}
              >
                I&apos;m {pair.asker.name} — ready
              </Button>
            </Card>
          )}

          {phase === "whisper" && (
            <Card className="space-y-6 p-5 py-8 text-center">
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
                className="h-auto w-full py-4 text-base"
                onClick={() => setPhase("aloud")}
              >
                Done whispering
              </Button>
            </Card>
          )}

          {phase === "aloud" && (
            <Card className="space-y-6 p-5 py-10 text-center">
              <p className="text-4xl">📢</p>
              <h2 className="text-xl font-semibold">
                <span className="text-violet-300">{pair.target.name}</span>:
                say your answer out loud — just a name!
              </h2>
              <p className="text-sm text-zinc-400">
                Then flip the coin. Heads and everyone hears the question…
              </p>
              <Button className="h-auto w-full py-4 text-base" onClick={flipCoin}>
                🪙 Flip the coin
              </Button>
            </Card>
          )}

          {phase === "flipping" && (
            <Card className="space-y-6 p-5 py-14 text-center" aria-live="polite">
              <p className="animate-spin text-6xl" aria-hidden="true">
                🪙
              </p>
              <p className="text-lg font-semibold text-zinc-300">
                The coin is in the air…
              </p>
            </Card>
          )}

          {phase === "result" && (
            <Card className="space-y-6 p-5 py-8 text-center" aria-live="polite">
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
              <Button className="h-auto w-full py-4 text-base" onClick={nextRound}>
                {deckPos + 1 >= questions.length
                  ? "Finish game"
                  : "Next round →"}
              </Button>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-5">
          <p className="text-center text-sm text-zinc-400">
            Couldn&apos;t pick a pair — check your player list.
          </p>
        </Card>
      )}
    </PageContainer>
  );
}
