import type { Metadata } from "next";
import Link from "next/link";
import SpinTheBottleGameComponent from "./_components/SpinTheBottleGameComponent";

export function generateMetadata(): Metadata {
  return {
    title: "Spin the Bottle",
    description:
      "Spin the bottle and let it pick the next player. No setup, just tap and spin.",
  };
}

export default function SpinTheBottlePage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          &larr; Back home
        </Link>
        <h1 className="mt-3 text-center text-2xl font-bold sm:text-3xl">
          <span aria-hidden="true">🍾</span> Spin the Bottle
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-400">
          Sit in a circle, spin, and see who the bottle picks.
        </p>
      </div>
      <div className="flex-1">
        <SpinTheBottleGameComponent />
      </div>
    </main>
  );
}
