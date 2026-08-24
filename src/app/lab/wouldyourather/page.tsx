import type { Metadata } from "next";
import WouldYouRatherGame from "./WouldYouRatherGame";

export const metadata: Metadata = {
  title: "Would You Rather — Party Games",
  description:
    "Impossible choices, big laughs. Tap your pick and let the group argue it out.",
};

export default function WouldYouRatherPage() {
  return <WouldYouRatherGame />;
}
