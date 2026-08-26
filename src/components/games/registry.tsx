import type { GameSlug } from "@/lib/games";
import type { ComponentType } from "react";
import CharadesGame from "./CharadesGame";
import TruthOrDareGame from "./TruthOrDareGame";
import MostLikelyToGame from "./MostLikelyToGame";
import FiveSecondsGame from "./FiveSecondsGame";
import NeverHaveIEverGame from "./NeverHaveIEverGame";
import BoomItGame from "./BoomItGame";
import WouldYouRatherGame from "./WouldYouRatherGame";
import ParanoiaGame from "./ParanoiaGame";
import WordSpyGame from "./WordSpyGame";
import OddOneOutGame from "./OddOneOutGame";
import FibberGame from "./FibberGame";
import PartyModeGame from "./PartyModeGame";
import DoodleChainGame from "./DoodleChainGame";
import ForbiddenGame from "./ForbiddenGame";
import WavelengthGame from "./WavelengthGame";
import DeeperGame from "./DeeperGame";
import FlipSideGame from "./FlipSideGame";

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
  wouldyourather: WouldYouRatherGame,
  paranoia: ParanoiaGame,
  wordspy: WordSpyGame,
  oddoneout: OddOneOutGame,
  fibber: FibberGame,
  partymode: PartyModeGame,
  doodlechain: DoodleChainGame,
  forbidden: ForbiddenGame,
  wavelength: WavelengthGame,
  deeper: DeeperGame,
  flipside: FlipSideGame,
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
