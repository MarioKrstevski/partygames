"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { copySharedDeck, type CopyDeckState } from "@/app/actions/share";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      disabled={pending}
      className="h-auto w-full py-4 text-base"
    >
      {pending ? "Saving…" : "Save to my decks"}
    </Button>
  );
}

export default function CopyDeckButton({
  token,
  signedIn,
}: {
  token: string;
  signedIn: boolean;
}) {
  const [state, formAction] = useActionState<CopyDeckState, FormData>(
    () => copySharedDeck(token, {}),
    {},
  );

  if (!signedIn) {
    return (
      <Button asChild variant="secondary" className="h-auto w-full py-4 text-base">
        <Link href={`/signin?next=${encodeURIComponent(`/d/${token}`)}`}>
          Sign in to save it
        </Link>
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <SubmitButton />
      {state.error && (
        <p role="alert" className="text-center text-xs text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
