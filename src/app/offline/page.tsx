import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline — games you have already opened still work.",
};

export default function OfflinePage() {
  return (
    <PageContainer className="flex min-h-[70dvh] max-w-md flex-col items-center justify-center gap-5 text-center">
      <p className="text-6xl" aria-hidden>
        📴
      </p>
      <div>
        <h1 className="text-2xl font-bold">No connection</h1>
        <p className="mt-2 text-zinc-400">
          This page has not been opened on this phone before, so there is
          nothing saved for it. Games and decks you have already visited still
          work perfectly without wifi.
        </p>
      </div>
      <Button asChild className="h-auto px-6 py-3 text-base">
        <Link href="/">Back to the games</Link>
      </Button>
    </PageContainer>
  );
}
