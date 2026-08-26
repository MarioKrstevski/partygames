/**
 * Flip Side: the room commits to a side out loud and simultaneously, then the
 * phone makes one side argue against itself. No names, no turns — the app is
 * purely a conductor.
 */

export type Side = "agree" | "disagree";

export interface Twist {
  id: string;
  /** Filled with the side that has to switch. */
  text: (side: Side) => string;
  /** Seconds on the clock for the argument. */
  seconds: number;
}

const SIDE_LABEL: Record<Side, string> = {
  agree: "AGREE",
  disagree: "DISAGREE",
};

export function sideLabel(side: Side): string {
  return SIDE_LABEL[side];
}

export function otherSide(side: Side): Side {
  return side === "agree" ? "disagree" : "agree";
}

/**
 * The variants keep the format from going stale. Most rounds are the plain
 * flip; the rarer ones exist so the room cannot settle into a rhythm.
 */
export const TWISTS: Twist[] = [
  {
    id: "flip",
    text: (side) =>
      `Everyone who said ${SIDE_LABEL[side]} — argue the opposite. 30 seconds.`,
    seconds: 30,
  },
  {
    id: "flip",
    text: (side) =>
      `${SIDE_LABEL[side]} camp: convince the room you always thought the opposite.`,
    seconds: 30,
  },
  {
    id: "solo",
    text: (side) =>
      `Loudest ${SIDE_LABEL[side]} voice — you alone defend the other side. 20 seconds.`,
    seconds: 20,
  },
  {
    id: "both",
    text: () => "Everyone swaps. Both sides argue the opposite. Good luck.",
    seconds: 30,
  },
  {
    id: "quiet",
    text: (side) =>
      `Whoever answered ${SIDE_LABEL[side]} last — you have 20 seconds to change one mind.`,
    seconds: 20,
  },
];

export function pickSide(random: () => number = Math.random): Side {
  return random() < 0.5 ? "agree" : "disagree";
}

export function pickTwist(random: () => number = Math.random): Twist {
  // The plain flip appears twice, so it lands about 40% of the time.
  return TWISTS[Math.floor(random() * TWISTS.length)];
}
