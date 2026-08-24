"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { DeckActionState } from "@/app/actions/decks";
import { Button } from "@/components/ui";

function ConfirmDeleteButton({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting…" : "Yes, delete forever"}
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
        Cancel
      </Button>
    </div>
  );
}

export default function DeleteDeckButton({
  deckName,
  action,
}: {
  deckName: string;
  action: () => Promise<DeckActionState>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <Button type="button" variant="danger" onClick={() => setConfirming(true)}>
        Delete deck
      </Button>
    );
  }

  return (
    <form
      action={async () => {
        setError(null);
        const result = await action();
        if (result?.error) setError(result.error);
      }}
      className="space-y-2"
    >
      <p className="text-sm text-zinc-300">
        Delete <span className="font-semibold text-white">{deckName}</span>?
        This can&apos;t be undone.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <ConfirmDeleteButton onCancel={() => setConfirming(false)} />
    </form>
  );
}
