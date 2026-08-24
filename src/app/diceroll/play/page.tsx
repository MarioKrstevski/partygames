import type { Metadata } from "next";
import Link from "next/link";
import DiceRollGameComponent from "./DiceRollGameComponent";

export function generateMetadata(): Metadata {
  return {
    title: "Dice Roll",
    description:
      "Roll up to three animated dice right from your phone — no table, no dice needed.",
  };
}

export default function DiceRollPage() {
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
          <span aria-hidden="true">🎲</span> Dice Roll
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-400">
          Pick how many dice you need and give them a roll.
        </p>
      </div>
      <div className="flex-1">
        <DiceRollGameComponent />
      </div>
    </main>
  );
}
