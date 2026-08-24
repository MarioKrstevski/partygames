"use client";

import { useTransition } from "react";
import { adminDeleteDeck } from "./actions";

interface DeleteDeckButtonProps {
  deckId: string;
  gameSlug: string;
  deckName: string;
}

export default function DeleteDeckButton({ deckId, gameSlug, deckName }: DeleteDeckButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete "${deckName}"? This cannot be undone.`)) return;
    startTransition(() => adminDeleteDeck(deckId, gameSlug));
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
