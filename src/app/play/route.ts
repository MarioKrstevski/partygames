import { NextResponse } from "next/server";
import { getPlannableDecks } from "@/lib/decks";
import { GAMES, isGameSlug } from "@/lib/games";

export const dynamic = "force-dynamic";

/**
 * "Start playing now": straight into a game with nothing to set up.
 * Picks a random light, English deck of a game that needs no player roster.
 */
export async function GET(request: Request) {
  const decks = await getPlannableDecks(null);
  const candidates = decks.filter(
    (d) =>
      isGameSlug(d.gameType) &&
      !GAMES[d.gameType].roster &&
      d.tier === "light" &&
      d.language === "en",
  );
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const target = pick ? `/${pick.gameType}/play/${pick.id}` : "/#games";
  return NextResponse.redirect(new URL(target, request.url), 307);
}
