"use client";

import { ButtonLink } from "@/components/button-link";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span aria-hidden className="text-6xl">
        🪩
      </span>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
        Well, that killed the vibe
      </h1>
      <p className="mt-2 max-w-md text-zinc-400">
        Something went wrong on our end. Give it another spin — the party
        isn&apos;t over.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
