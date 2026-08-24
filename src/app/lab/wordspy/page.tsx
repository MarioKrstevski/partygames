import type { Metadata } from "next";
import WordSpyGame from "./WordSpyGame";

export const metadata: Metadata = {
  title: "Word Spy — Party Games",
  description:
    "Everyone knows the secret word — except the spy. Describe it vaguely, sniff out the impostor, and vote them out.",
};

export default function WordSpyPage() {
  return <WordSpyGame />;
}
