import type { GameSlug } from "@/lib/games";
import type { ComponentType } from "react";
import CharadesGame from "./CharadesGame";
import TruthOrDareGame from "./TruthOrDareGame";
import MostLikelyToGame from "./MostLikelyToGame";
import FiveSecondsGame from "./FiveSecondsGame";
import NeverHaveIEverGame from "./NeverHaveIEverGame";
import BoomItGame from "./BoomItGame";

export interface PlayableDeck {
  id: string;
  name: string;
  content: Record<string, string[]>;
}

const GAME_COMPONENTS: Record<
  GameSlug,
  ComponentType<{ deck: PlayableDeck }>
> = {
  charades: CharadesGame,
  truthordare: TruthOrDareGame,
  mostlikelyto: MostLikelyToGame,
  fiveseconds: FiveSecondsGame,
  neverhaveiever: NeverHaveIEverGame,
  boomit: BoomItGame,
};

export function GamePlayer({
  slug,
  deck,
}: {
  slug: GameSlug;
  deck: PlayableDeck;
}) {
  const Game = GAME_COMPONENTS[slug];
  return <Game deck={deck} />;
}
