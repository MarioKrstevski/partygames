"use client";

import { useEffect, useState } from "react";
import { freshness } from "@/lib/freshness";

/**
 * How much of a deck this phone has already been through. Renders nothing
 * until it has read storage, so the server and client markup agree.
 */
export default function DeckFreshness({
  deckId,
  entries,
}: {
  deckId: string;
  entries: string[];
}) {
  const [state, setState] = useState<{ seen: number; total: number } | null>(
    null,
  );

  useEffect(() => {
    setState(freshness(deckId, entries));
  }, [deckId, entries]);

  if (!state || state.seen === 0) return null;

  const done = state.seen >= state.total;
  return (
    <span
      className={
        done
          ? "text-xs text-amber-300/80"
          : "text-xs text-zinc-500"
      }
      title={
        done
          ? "You have played every card in this deck — it will start over."
          : "Cards you have not seen come first."
      }
    >
      {done ? "🔁 all seen" : `${state.seen}/${state.total} seen`}
    </span>
  );
}
