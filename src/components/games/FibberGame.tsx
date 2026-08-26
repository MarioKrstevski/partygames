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
import {
  buildOptions,
  parseTrivia,
  scoreVotes,
  type Option,
  type TriviaCard,
  type Vote,
} from "@/lib/fibber";

/** Same derivation on both sides, so the stored hash matches. */
const cardKey = (c: TriviaCard) => `${c.question}|${c.answer}`;

type Phase = "setup" | "faking" | "voting" | "reveal";

type FibberGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function FibberGame({ deck }: FibberGameProps) {
  const { roster, update, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("setup");
  const [cards, setCards] = useState<TriviaCard[]>([]);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voterIndex, setVoterIndex] = useState(0);
  const [votePassing, setVotePassing] = useState(true);
  const [totals, setTotals] = useState<Record<string, number>>({});

  const allCards = parseTrivia(deck.content.questions ?? []);
  const players = roster.players;
  const enoughPlayers = players.length >= 3;
  const card = cards[round];
  useSeen(deck.id, card ? cardKey(card) : null);
  const voter = players[voterIndex];

  function startGame() {
    setCards(shuffleFresh(allCards, deck.id, cardKey));
    setRound(0);
    setTotals({});
    setPhase("faking");
  }

  function handleFakes(entries: PassAroundEntry[]) {
    if (!card) return;
    setOptions(
      buildOptions(
        card.answer,
        entries.map((e) => ({
          playerId: e.playerId,
          playerName: e.playerName,
          text: e.text,
        })),
      ),
    );
    setVotes([]);
    setVoterIndex(0);
    setVotePassing(true);
    setPhase("voting");
  }

  function castVote(optionId: string) {
    if (!voter) return;
    vibrate(40);
    const next = [...votes, { voterId: voter.id, optionId }];

    if (voterIndex + 1 >= players.length) {
      const roundScores = scoreVotes(next, options);
      setTotals((current) => {
        const updated = { ...current };
        for (const [playerId, points] of Object.entries(roundScores)) {
          updated[playerId] = (updated[playerId] ?? 0) + points;
        }
        return updated;
      });
      setVotes(next);
      setPhase("reveal");
      return;
    }
    setVotes(next);
    setVoterIndex(voterIndex + 1);
    setVotePassing(true);
  }

  function nextRound() {
    if (round + 1 >= cards.length) {
      startGame();
      return;
    }
    setRound(round + 1);
    setPhase("faking");
  }

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/fibber" className="transition-colors hover:text-white">
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
          <h1 className="text-3xl font-bold">🤥 Fibber</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Write a convincing fake answer, then pick the real one out of the
            pile. Fool your friends to score.
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
          disabled={!enoughPlayers || allCards.length === 0}
          onClick={startGame}
        >
          Start game
        </Button>
      </PageContainer>
    );
  }

  if (phase === "faking" && card) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Round {round + 1} / {cards.length}
          </span>
          <span>🤥 write a lie</span>
        </div>
        <PassAroundInput
          key={round}
          players={players}
          prompt={card.question}
          instruction="Invent an answer convincing enough to fool the others"
          placeholder="Your best fake…"
          onComplete={handleFakes}
        />
      </PageContainer>
    );
  }

  if (phase === "voting" && card && voter) {
    if (votePassing) {
      return (
        <PageContainer className="max-w-xl space-y-5">
          {header}
          <Card className="space-y-4 p-5 py-10 text-center">
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              Voter {voterIndex + 1} of {players.length}
            </p>
            <p className="text-4xl">🗳️</p>
            <p className="text-2xl font-bold">Pass to {voter.name}</p>
            <Button
              type="button"
              className="mx-auto h-auto w-full max-w-xs py-4 text-base"
              onClick={() => setVotePassing(false)}
            >
              I&apos;m {voter.name}
            </Button>
          </Card>
        </PageContainer>
      );
    }

    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            {voter.name}, which one is true?
          </p>
          <h2 className="mt-2 text-xl font-bold leading-snug">
            {card.question}
          </h2>
        </div>
        <div className="grid gap-2">
          {options.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="secondary"
              disabled={option.authorId === voter.id}
              className="h-auto w-full justify-start py-4 text-left text-base"
              onClick={() => castVote(option.id)}
            >
              {option.text}
              {option.authorId === voter.id && (
                <span className="ml-2 text-xs text-zinc-500">(yours)</span>
              )}
            </Button>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (phase === "reveal" && card) {
    const votesByOption = new Map<string, string[]>();
    for (const vote of votes) {
      const voterName =
        players.find((p) => p.id === vote.voterId)?.name ?? "?";
      votesByOption.set(vote.optionId, [
        ...(votesByOption.get(vote.optionId) ?? []),
        voterName,
      ]);
    }

    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <Card className="space-y-2 p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            The truth was
          </p>
          <p className="text-2xl font-bold text-violet-300">{card.answer}</p>
          <p className="text-sm text-zinc-400">{card.question}</p>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Where the votes went
          </h3>
          <ul className="space-y-2">
            {options.map((option) => {
              const voters = votesByOption.get(option.id) ?? [];
              const isTruth = option.authorId === null;
              return (
                <li
                  key={option.id}
                  className={`rounded-xl border px-3 py-2 ${
                    isTruth
                      ? "border-emerald-400/40 bg-emerald-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {option.text}{" "}
                        {isTruth && (
                          <span className="text-xs text-emerald-300">
                            ✓ true
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {isTruth
                          ? "The real answer"
                          : `Fake by ${option.authorName}`}
                        {voters.length > 0 &&
                          (isTruth
                            ? ` — found by: ${voters.join(", ")}`
                            : ` — fooled: ${voters.join(", ")}`)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-zinc-400">
                      {voters.length}
                    </span>
                  </div>
                </li>
              );
            })}
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
                  <span>{player.name}</span>
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
          {round + 1 >= cards.length ? "Reshuffle & keep going" : "Next round →"}
        </Button>
      </PageContainer>
    );
  }

  return null;
}
