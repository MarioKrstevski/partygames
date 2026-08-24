"use client";

import { useTransition } from "react";
import { togglePublic } from "./actions";

interface TogglePublicButtonProps {
  deckId: string;
  isPublic: boolean;
}

export default function TogglePublicButton({ deckId, isPublic }: TogglePublicButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => togglePublic(deckId, isPublic));
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isPublic
          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
          : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"
      }`}
    >
      {pending ? "…" : isPublic ? "✓ Public" : "Private"}
    </button>
  );
}
