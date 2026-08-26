"use client";

import { useState } from "react";
import Link from "next/link";
import PlayerSetup from "@/components/players/PlayerSetup";
import PassAroundInput, {
  type PassAroundEntry,
} from "@/components/players/PassAroundInput";
import { usePlayers } from "@/components/players/usePlayers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";
import { shuffleArray, vibrate } from "@/lib/utils";
import { shuffleFresh } from "@/lib/freshness";
import { useSeen } from "@/lib/use-seen";
import { scoreRound, type RoundResult } from "@/lib/oddoneout";

type Phase = "setup" | "answering" | "reveal";

type OddOneOutGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function OddOneOutGame({ deck }: OddOneOutGameProps) {
  const { roster, update, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [cows, setCows] = useState<Record<string, number>>({});

  const allQuestions = deck.content.questions ?? [];
  const players = roster.players;
  const enoughPlayers = players.length >= 3;
  const question = questions[round];
  useSeen(deck.id, question);

  function startGame() {
    setQuestions(shuffleFresh(allQuestions, deck.id));
    setRound(0);
    setResult(null);
    setTotals({});
    setCows({});
    setPhase("answering");
  }

  function handleAnswers(entries: PassAroundEntry[]) {
    const outcome = scoreRound(
      entries.map((e) => ({
        playerId: e.playerId,
        playerName: e.playerName,
        answer: e.text,
      })),
    );
    vibrate(outcome.pinkCow ? [120, 60, 120] : 60);

    setTotals((current) => {
      const next = { ...current };
      for (const scorer of outcome.scorers) {
        next[scorer.playerId] = (next[scorer.playerId] ?? 0) + 1;
      }
      return next;
    });
    if (outcome.pinkCow) {
      const cowId = outcome.pinkCow.playerId;
      setCows((current) => ({ ...current, [cowId]: (current[cowId] ?? 0) + 1 }));
    }
    setResult(outcome);
    setPhase("reveal");
  }

  function nextRound() {
    if (round + 1 >= questions.length) {
      startGame();
      return;
    }
    setRound(round + 1);
    setResult(null);
    setPhase("answering");
  }

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/oddoneout" className="transition-colors hover:text-white">
        Exit
      </Link>
    </div>
  );

  if (!ready) {
    return (
      <PageContainer className="max-w-xl">
        {header}
        <p className="text-center text-zinc-500">Loading…</p>
      </PageContainer>
    );
  }

  if (phase === "setup") {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div>
          <h1 className="text-3xl font-bold">🐮 Odd One Out</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Everyone answers the same question in secret. Think like the herd —
            the lone wolf takes the Pink Cow.
          </p>
        </div>

        {!enoughPlayers && (
          <Card className="border-amber-400/30 bg-amber-400/10 p-5">
            <p className="text-sm text-amber-200">
              Needs at least <strong>3 players</strong> — add{" "}
              {3 - players.length} more below.
            </p>
          </Card>
        )}

        <PlayerSetup roster={roster} onChange={update} showModes={false} />

        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          disabled={!enoughPlayers || allQuestions.length === 0}
          onClick={startGame}
        >
          Start game
        </Button>
      </PageContainer>
    );
  }

  if (phase === "answering" && question) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Round {round + 1} / {questions.length}
          </span>
          <span>🐮 herd rules</span>
        </div>
        <PassAroundInput
          key={round}
          players={players}
          prompt={question}
          instruction="Type the answer you think most people will give"
          placeholder="Keep it short…"
          onComplete={handleAnswers}
        />
      </PageContainer>
    );
  }

  if (phase === "reveal" && result) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Round {round + 1}
          </p>
          <h2 className="text-xl font-bold leading-snug">{question}</h2>
        </div>

        {result.pinkCow ? (
          <Card className="space-y-2 border-pink-400/40 bg-pink-500/10 p-5 text-center">
            <p className="text-4xl">🐷</p>
            <p className="text-lg font-bold text-pink-200">
              {result.pinkCow.playerName} takes the Pink Cow!
            </p>
            <p className="text-sm text-pink-200/80">
              Everyone else agreed. They did not.
            </p>
          </Card>
        ) : result.allDifferent ? (
          <Card className="space-y-1 p-5 text-center">
            <p className="text-4xl">🤷</p>
            <p className="font-semibold">No herd at all — nobody scores.</p>
          </Card>
        ) : (
          <Card className="space-y-1 p-5 text-center">
            <p className="text-4xl">🐮</p>
            <p className="font-semibold">
              The herd said &ldquo;{result.groups[0].label}&rdquo;
            </p>
            <p className="text-sm text-zinc-400">
              {result.scorers.length} player
              {result.scorers.length === 1 ? "" : "s"} scored.
            </p>
          </Card>
        )}

        <Card className="space-y-3 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Answers
          </h3>
          <ul className="space-y-2">
            {result.groups.map((group) => (
              <li
                key={group.label}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div>
                  <p className="font-semibold">{group.label}</p>
                  <p className="text-xs text-zinc-400">
                    {group.players.map((p) => p.playerName).join(", ")}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-zinc-400">
                  ×{group.players.length}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-2 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Scores
          </h3>
          <ul className="space-y-1 text-sm">
            {players
              .slice()
              .sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0))
              .map((player) => (
                <li key={player.id} className="flex justify-between gap-3">
                  <span>
                    {player.name}
                    {cows[player.id]
                      ? ` ${"🐷".repeat(Math.min(cows[player.id], 3))}`
                      : ""}
                  </span>
                  <span className="tabular-nums text-zinc-300">
                    {totals[player.id] ?? 0}
                  </span>
                </li>
              ))}
          </ul>
        </Card>

        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          onClick={nextRound}
        >
          {round + 1 >= questions.length ? "Reshuffle & keep going" : "Next round →"}
        </Button>
      </PageContainer>
    );
  }

  return null;
}
