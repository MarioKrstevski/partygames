"use client";

import { useState } from "react";
import Link from "next/link";
import PlayerSetup from "@/components/players/PlayerSetup";
import { usePlayers } from "@/components/players/usePlayers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";
import { shuffleArray, vibrate } from "@/lib/utils";
import { pickFresh, shuffleFresh } from "@/lib/freshness";
import { fillPlaceholders } from "@/lib/prompts";

/** How many cards a rule stays in force for once dealt. */
const RULE_LIFETIME = 6;
/** Roughly one in five cards is a new rule. */
const RULE_CHANCE = 0.2;

interface ActiveRule {
  id: number;
  text: string;
  expiresAtCard: number;
}

type Phase = "setup" | "playing";

type PartyModeGameProps = {
  deck: {
    id: string;
    name: string;
    content: Record<string, string[]>;
  };
};

export default function PartyModeGame({ deck }: PartyModeGameProps) {
  const { roster, update, ready } = usePlayers();
  const [phase, setPhase] = useState<Phase>("setup");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [promptPos, setPromptPos] = useState(0);
  const [cardCount, setCardCount] = useState(0);
  const [current, setCurrent] = useState<{ text: string; isRule: boolean } | null>(
    null,
  );
  const [activeRules, setActiveRules] = useState<ActiveRule[]>([]);

  const allPrompts = deck.content.prompts ?? [];
  const allRules = deck.content.rules ?? [];
  const players = roster.players;
  const enoughPlayers = players.length >= 2;

  function startGame() {
    const shuffled = shuffleFresh(allPrompts, deck.id);
    setPrompts(shuffled);
    setPromptPos(0);
    setCardCount(0);
    setActiveRules([]);
    setCurrent(null);
    setPhase("playing");
    dealFrom(shuffled, 0, 0, []);
  }

  function dealFrom(
    deckPrompts: string[],
    pos: number,
    count: number,
    rules: ActiveRule[],
  ) {
    const nextCount = count + 1;
    const expired = rules.filter((r) => r.expiresAtCard > nextCount);

    const dealRule =
      allRules.length > 0 && expired.length < 3 && Math.random() < RULE_CHANCE;

    if (dealRule) {
      const rule = pickFresh(allRules, `${deck.id}:rules`);
      if (!rule) return;
      const text = fillPlaceholders(rule, players);
      setActiveRules([
        ...expired,
        { id: nextCount, text, expiresAtCard: nextCount + RULE_LIFETIME },
      ]);
      setCurrent({ text, isRule: true });
      setCardCount(nextCount);
      return;
    }

    // Reshuffle when the prompt deck runs out so the night never stops.
    const source =
      pos >= deckPrompts.length ? shuffleFresh(allPrompts, deck.id) : deckPrompts;
    const index = pos >= deckPrompts.length ? 0 : pos;
    const text = fillPlaceholders(source[index] ?? "", players);

    setPrompts(source);
    setPromptPos(index + 1);
    setActiveRules(expired);
    setCurrent({ text, isRule: false });
    setCardCount(nextCount);
  }

  function deal() {
    vibrate(40);
    dealFrom(prompts, promptPos, cardCount, activeRules);
  }

  const header = (
    <div className="mb-6 flex items-center justify-between text-sm text-zinc-400">
      <span className="truncate font-medium">{deck.name}</span>
      <Link href="/partymode" className="transition-colors hover:text-white">
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
          <h1 className="text-3xl font-bold">🎉 Party Mode</h1>
          <p className="mt-1 text-sm text-zinc-400">
            One endless deck that calls people out by name. Add everyone
            playing — the cards do the rest.
          </p>
        </div>

        {!enoughPlayers && (
          <Card className="border-amber-400/30 bg-amber-400/10 p-5">
            <p className="text-sm text-amber-200">
              Needs at least <strong>2 players</strong> so the cards have names
              to use.
            </p>
          </Card>
        )}

        <PlayerSetup roster={roster} onChange={update} showModes={false} />

        <Button
          type="button"
          className="h-auto w-full py-4 text-base"
          disabled={!enoughPlayers || allPrompts.length === 0}
          onClick={startGame}
        >
          Deal the first card
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex min-h-[calc(100dvh-3.5rem)] max-w-xl flex-col">
      {header}

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Card {cardCount}</span>
        <span>{players.length} playing</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-8">
        {current && (
          <div
            aria-live="polite"
            className={`w-full rounded-3xl border p-8 text-center ${
              current.isRule
                ? "border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-amber-500/5"
                : "border-violet-400/30 bg-gradient-to-b from-violet-600/25 to-pink-500/10"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${
                current.isRule ? "text-amber-300" : "text-violet-300"
              }`}
            >
              {current.isRule ? "📜 New rule" : "🎯 Your card"}
            </p>
            <p className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
              {current.text}
            </p>
            {current.isRule && (
              <p className="mt-4 text-sm text-amber-200/80">
                Stays in force for the next {RULE_LIFETIME} cards.
              </p>
            )}
          </div>
        )}
      </div>

      {activeRules.length > 0 && (
        <Card className="mb-4 space-y-2 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Rules in force
          </h3>
          <ul className="space-y-1 text-sm text-zinc-300">
            {activeRules.map((rule) => (
              <li key={rule.id} className="flex justify-between gap-3">
                <span>📜 {rule.text}</span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {rule.expiresAtCard - cardCount} left
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-2 pb-2">
        <Button
          type="button"
          className="h-auto w-full py-5 text-lg"
          onClick={deal}
        >
          Next card →
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setPhase("setup")}
        >
          Edit players
        </Button>
      </div>
    </PageContainer>
  );
}
