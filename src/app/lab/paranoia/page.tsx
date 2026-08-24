import type { Metadata } from "next";
import ParanoiaGame from "./ParanoiaGame";

export const metadata: Metadata = {
  title: "Paranoia — Party Games Lab",
  description:
    "Whisper a question, answer out loud, flip a coin. Heads reveals the question — tails keeps everyone guessing.",
};

export default function ParanoiaPage() {
  return <ParanoiaGame />;
}
