"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";
import { cn, shuffleArray, vibrate } from "@/lib/utils";
import { shuffleFresh } from "@/lib/freshness";
import { useSeen } from "@/lib/use-seen";
import {
  addPoint,
  describerFor,
  parseTabooCards,
  splitTeams,
  winnerOf,
  type Scores,
  type TabooCard,
  type TeamId,
  type Teams,
} from "@/lib/forbidden";

/** Same derivation on both sides, so the stored hash matches. */
const tabooKey = (c: TabooCard) => c.word;

const ROUND_SECONDS = 60;
const TARGET_SCORE = 10;

type Phase = "setup" | "handoff" | "playing" | "roundover" | "won";

type ForbiddenGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

const TEAM_STYLES: Record<TeamId, string> = {
  0: "text-violet-300",
  1: "text-pink-300",
};

export default function ForbiddenGame({ deck }: ForbiddenGameProps) {
  const { roster, update, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("setup");
  const [teams, setTeams] = useState<Teams | null>(null);
  const [cards, setCards] = useState<TabooCard[]>([]);
  const [cardPos, setCardPos] = useState(0);
  const [team, setTeam] = useState<TeamId>(0);
  const [turnsTaken, setTurnsTaken] = useState<[number, number]>([0, 0]);
  const [scores, setScores] = useState<Scores>({ 0: 0, 1: 0 });
  const [roundGot, setRoundGot] = useState(0);
  const [roundPassed, setRoundPassed] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);

  const allCards = parseTabooCards(deck.content.cards ?? []);
  const players = roster.players;
  const enoughPlayers = players.length >= 4;
  const card = cards[cardPos];
  useSeen(deck.id, card ? tabooKey(card) : null);
  const describer = teams ? describerFor(teams, team, turnsTaken[team]) : null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          vibrate([200, 100, 200]);
          setPhase("roundover");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function startGame() {
    if (allCards.length === 0 || !enoughPlayers) return;
    setTeams(splitTeams(players));
    setCards(shuffleFresh(allCards, deck.id, tabooKey));
    setCardPos(0);
    setTeam(0);
    setTurnsTaken([0, 0]);
    setScores({ 0: 0, 1: 0 });
    setPhase("handoff");
  }

  function beginRound() {
    setRoundGot(0);
    setRoundPassed(0);
    setSecondsLeft(ROUND_SECONDS);
    setRunning(true);
    setPhase("playing");
  }

  function nextCard() {
    setCardPos((pos) => (pos + 1 >= cards.length ? 0 : pos + 1));
  }

  function got() {
    vibrate(60);
    setScores((current) => addPoint(current, team));
    setRoundGot((n) => n + 1);
    nextCard();
  }

  function pass() {
    vibrate(30);
    setRoundPassed((n) => n + 1);
    nextCard();
  }

  function endRound() {
    setRunning(false);
    const champion = winnerOf(scores, TARGET_SCORE);
    if (champion !== null) {
      setPhase("won");
      return;
    }
    setTurnsTaken((current) => {
      const next: [number, number] = [...current] as [number, number];
      next[team] += 1;
      return next;
    });
    setTeam((current) => (current === 0 ? 1 : 0));
    setPhase("handoff");
  }

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/forbidden" className="transition-colors hover:text-white">
        Exit
      </Link>
    </div>
  );

  const scoreboard = teams && (
    <div className="grid grid-cols-2 gap-2">
      {([0, 1] as TeamId[]).map((id) => (
        <Card
          key={id}
          className={cn(
            "p-3 text-center",
            team === id && phase !== "won" && "border-white/30 bg-white/10",
          )}
        >
          <p className={cn("text-xs font-semibold", TEAM_STYLES[id])}>
            {teams.names[id]}
          </p>
          <p className="text-2xl font-bold tabular-nums">{scores[id]}</p>
          <p className="truncate text-xs text-zinc-500">
            {teams.members[id].map((p) => p.name).join(", ") || "—"}
          </p>
        </Card>
      ))}
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

  // ---- Setup ----------------------------------------------------------------
  if (phase === "setup") {
    const preview = splitTeams(players);
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        <div>
          <h1 className="text-3xl font-bold">🚫 Forbidden</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Get your team to say the word — without using any of the five words
            you would normally reach for. First to {TARGET_SCORE} wins.
          </p>
        </div>

        {!enoughPlayers ? (
          <Card className="border-amber-400/30 bg-amber-400/10 p-5">
            <p className="text-sm text-amber-200">
              Needs at least <strong>4 players</strong> for two teams — add{" "}
              {4 - players.length} more below.
            </p>
          </Card>
        ) : (
          <Card className="space-y-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Teams
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {([0, 1] as TeamId[]).map((id) => (
                <div key={id}>
                  <p className={cn("text-sm font-semibold", TEAM_STYLES[id])}>
                    {preview.names[id]}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {preview.members[id].map((p) => p.name).join(", ")}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Teams are dealt alternately down your player list — reorder the
              list below to change who lands where.
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
          Start the clock
        </Button>
      </PageContainer>
    );
  }

  // ---- Handoff --------------------------------------------------------------
  if (phase === "handoff" && teams) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        {scoreboard}
        <Card className="space-y-4 p-5 py-12 text-center">
          <p className="text-4xl">📱</p>
          <p className="text-sm text-zinc-400">
            <span className={TEAM_STYLES[team]}>{teams.names[team]}</span> is up
          </p>
          <p className="text-2xl font-bold">
            {describer ? `${describer.name} describes` : "Pick a describer"}
          </p>
          <p className="text-sm text-zinc-400">
            Everyone else on the team shouts guesses. The other team watches for
            banned words.
          </p>
          <Button
            type="button"
            className="mx-auto h-auto w-full max-w-xs py-4 text-base"
            onClick={beginRound}
          >
            Start {ROUND_SECONDS}s
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Playing --------------------------------------------------------------
  if (phase === "playing" && card && teams) {
    return (
      <PageContainer className="max-w-xl space-y-4">
        {header}
        <div className="flex items-center justify-between">
          <p className={cn("text-sm font-semibold", TEAM_STYLES[team])}>
            {teams.names[team]} · ✓ {roundGot}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums",
              secondsLeft <= 10 ? "text-red-400" : "text-zinc-200",
            )}
            aria-live="off"
          >
            {secondsLeft}s
          </p>
        </div>

        <Card className="space-y-4 p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Get them to say
          </p>
          <p className="text-4xl font-extrabold leading-tight">{card.word}</p>
          <div className="space-y-1 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-300">
              🚫 Forbidden
            </p>
            <ul className="space-y-0.5">
              {card.banned.map((word) => (
                <li key={word} className="text-lg font-semibold text-red-200">
                  {word}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-auto w-full py-5 text-base"
            onClick={pass}
          >
            ✗ Pass
          </Button>
          <Button
            type="button"
            className="h-auto w-full py-5 text-base"
            onClick={got}
          >
            ✓ Got it
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setRunning(false);
            setPhase("roundover");
          }}
        >
          End the round early
        </Button>
      </PageContainer>
    );
  }

  // ---- Round over -----------------------------------------------------------
  if (phase === "roundover" && teams) {
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        {scoreboard}
        <Card className="space-y-3 p-5 py-10 text-center">
          <p className="text-4xl">⏰</p>
          <h2 className="text-2xl font-bold">Time!</h2>
          <p className="text-sm text-zinc-300">
            <span className={TEAM_STYLES[team]}>{teams.names[team]}</span> got{" "}
            <strong>{roundGot}</strong> and passed on {roundPassed}.
          </p>
          <Button
            type="button"
            className="mx-auto h-auto w-full max-w-xs py-4 text-base"
            onClick={endRound}
          >
            {winnerOf(addPoint(scores, team), TARGET_SCORE) !== null
              ? "See the result"
              : "Hand over to the other team"}
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // ---- Won ------------------------------------------------------------------
  if (phase === "won" && teams) {
    const champion = winnerOf(scores, TARGET_SCORE) ?? 0;
    return (
      <PageContainer className="max-w-xl space-y-5">
        {header}
        {scoreboard}
        <Card className="space-y-3 border-emerald-400/40 bg-emerald-500/10 p-6 text-center">
          <p className="text-5xl">🏆</p>
          <h2 className="text-2xl font-bold">
            {teams.names[champion]} wins
          </h2>
          <p className="text-sm text-zinc-300">
            {scores[champion]} to {scores[champion === 0 ? 1 : 0]}.
          </p>
          <Button
            className="mx-auto h-auto max-w-xs py-4 text-base"
            onClick={startGame}
          >
            Rematch 🔄
          </Button>
        </Card>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setPhase("setup")}
        >
          Change teams
        </Button>
      </PageContainer>
    );
  }

  return null;
}
