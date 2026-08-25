import type { DeckContent } from "./schema";

export const GAME_SLUGS = [
  "charades",
  "truthordare",
  "mostlikelyto",
  "fiveseconds",
  "neverhaveiever",
  "boomit",
  "wouldyourather",
  "paranoia",
  "wordspy",
  "oddoneout",
  "fibber",
  "partymode",
  "doodlechain",
] as const;

export type GameSlug = (typeof GAME_SLUGS)[number];

export const TOOL_SLUGS = ["spinthebottle", "diceroll"] as const;
export type ToolSlug = (typeof TOOL_SLUGS)[number];

/** One editable list inside a deck (e.g. "truths" and "dares"). */
export interface ContentSection {
  key: string;
  label: string;
  /** Shown under the textarea in the deck editor. */
  hint: string;
  placeholder: string;
  minItems: number;
  /**
   * Per-line validation applied when saving a deck. The pattern is kept as a
   * string (not RegExp) so game definitions stay serializable across the
   * server/client component boundary.
   */
  validateEntry?: { pattern: string; message: string };
}

export interface GameDef {
  slug: GameSlug;
  title: string;
  /** Short punchy line for cards and the landing page. */
  tagline: string;
  description: string;
  howToPlay: string[];
  emoji: string;
  /** Cover image. Games without one render an emoji tile instead. */
  image?: string;
  /** Minimum roster size; games without a roster leave this unset. */
  minPlayers?: number;
  sections: ContentSection[];
}

export interface ToolDef {
  slug: ToolSlug;
  title: string;
  tagline: string;
  emoji: string;
  image: string;
  href: string;
}

export const GAMES: Record<GameSlug, GameDef> = {
  charades: {
    slug: "charades",
    title: "Charades",
    tagline: "Act it out. No words allowed.",
    description:
      "Hold the phone to your forehead, act out or guess the word before the timer runs out. Tilt to score.",
    howToPlay: [
      "Pick a deck and hold the phone to your forehead facing your friends.",
      "They act out or describe the word — you guess.",
      "Got it? Tilt down. Pass? Tilt up. Beat the timer!",
    ],
    emoji: "🎭",
    image: "/assets/charades/charades-game-logo.png",
    sections: [
      {
        key: "items",
        label: "Words",
        hint: "One word or phrase per line — things players will act out.",
        placeholder: "Moonwalk\nMaking pizza\nJames Bond",
        minItems: 5,
      },
    ],
  },
  truthordare: {
    slug: "truthordare",
    title: "Truth or Dare",
    tagline: "Confess or commit. Your call.",
    description:
      "The classic party icebreaker. Pick truth to answer honestly, or dare to do the deed.",
    howToPlay: [
      "Pick a deck that fits your group's vibe.",
      "On your turn, choose Truth or Dare.",
      "Answer honestly or do the dare — no chickening out.",
    ],
    emoji: "🔥",
    image: "/assets/truthordare/truthordare-cover.png",
    sections: [
      {
        key: "truths",
        label: "Truths",
        hint: "One question per line.",
        placeholder: "What's your most embarrassing moment?",
        minItems: 3,
      },
      {
        key: "dares",
        label: "Dares",
        hint: "One dare per line.",
        placeholder: "Speak in an accent for the next 3 rounds",
        minItems: 3,
      },
    ],
  },
  mostlikelyto: {
    slug: "mostlikelyto",
    title: "Most Likely To",
    tagline: "Point fingers. Find out what your friends really think.",
    description:
      "Read the prompt, count to three, and everyone points at the person most likely to do it.",
    howToPlay: [
      "Read the prompt out loud.",
      "On three, everyone points at the person most likely to do it.",
      "Most fingers loses (or drinks, or explains themselves).",
    ],
    emoji: "👉",
    image: "/assets/mostlikelyto/mostlikelyto-cover.png",
    sections: [
      {
        key: "items",
        label: "Prompts",
        hint: 'One prompt per line, completing "Who is most likely to…".',
        placeholder: "…forget their own birthday\n…become famous",
        minItems: 5,
      },
    ],
  },
  fiveseconds: {
    slug: "fiveseconds",
    title: "5 Seconds",
    tagline: "Name three things. You have five seconds. Go!",
    description:
      "Easy questions, brutal time limit. Name three things in the category before five seconds run out.",
    howToPlay: [
      "Draw a category and start the 5-second timer.",
      "Name three things that fit before it runs out.",
      "Freeze up and the point goes to the group.",
    ],
    emoji: "⏱️",
    image: "/assets/fiveseconds/fiveseconds-cover.webp",
    sections: [
      {
        key: "items",
        label: "Categories",
        hint: 'One category per line, e.g. "3 pizza toppings".',
        placeholder: "3 pizza toppings\n3 movies with robots",
        minItems: 5,
      },
    ],
  },
  neverhaveiever: {
    slug: "neverhaveiever",
    title: "Never Have I Ever",
    tagline: "Learn who did what. Regret asking.",
    description:
      "Read the statement — everyone who HAS done it owns up. The stories write themselves.",
    howToPlay: [
      "Read the statement out loud.",
      "Everyone who has done it raises a hand (or drinks).",
      "Best stories get retold. Sorry in advance.",
    ],
    emoji: "🙈",
    image: "/assets/neverhaveiever/neverhaveiever-cover.png",
    sections: [
      {
        key: "items",
        label: "Statements",
        hint: 'One statement per line, completing "Never have I ever…".',
        placeholder: "…missed a flight\n…pretended to know a stranger",
        minItems: 5,
      },
    ],
  },
  boomit: {
    slug: "boomit",
    title: "Boom It",
    tagline: "Answer fast and pass the bomb before it blows.",
    description:
      "A hot-potato of questions. Answer and pass the phone — whoever holds it when it booms pays the punishment.",
    howToPlay: [
      "Read the prompt, answer it, pass the phone fast.",
      "The bomb timer is random — nobody knows when it blows.",
      "Holding it at boom? You take the punishment.",
    ],
    emoji: "💣",
    image: "/assets/boomit/boomit-cover.webp",
    sections: [
      {
        key: "statements",
        label: "Prompts",
        hint: "One quick prompt per line.",
        placeholder: "Name a country in South America",
        minItems: 5,
      },
      {
        key: "punishments",
        label: "Punishments",
        hint: "One punishment per line for whoever holds the boom.",
        placeholder: "Do 10 push-ups",
        minItems: 3,
      },
    ],
  },
  wouldyourather: {
    slug: "wouldyourather",
    title: "Would You Rather",
    tagline: "Impossible choices, zero mercy.",
    description:
      "Two options, both terrible (or both tempting). Everyone picks a side and defends it.",
    howToPlay: [
      "Read both options out loud.",
      "Everyone picks A or B — no abstaining.",
      "The minority explains themselves. Then next card.",
    ],
    emoji: "🤷",
    sections: [
      {
        key: "dilemmas",
        label: "Dilemmas",
        hint: 'One dilemma per line as "option A | option B".',
        placeholder:
          "never taste food again | never hear music again\nknow how you die | know when you die",
        minItems: 5,
        validateEntry: {
          pattern: "^[^|]+\\|[^|]+$",
          message:
            'each line needs exactly one "|" separating the two options',
        },
      },
    ],
  },
  paranoia: {
    slug: "paranoia",
    title: "Paranoia",
    tagline: "Whisper, answer, pray the coin stays down.",
    description:
      "Whisper a question to your neighbour, they answer with a name out loud. Heads: the question is revealed. Tails: the named player never finds out why.",
    howToPlay: [
      "Whisper the question on screen to the chosen player.",
      "They say a player's name out loud — just the name.",
      "Flip: heads reveals the question, tails keeps everyone guessing.",
    ],
    emoji: "🤫",
    minPlayers: 3,
    sections: [
      {
        key: "questions",
        label: "Questions",
        hint: 'One "Who here…" question per line.',
        placeholder:
          "Who here would survive longest in a zombie apocalypse?\nWho here gives the best hugs?",
        minItems: 5,
      },
    ],
  },
  wordspy: {
    slug: "wordspy",
    title: "Word Spy",
    tagline: "Everyone knows the word. One of you is lying.",
    description:
      "Everyone sees the secret word except the spy. Describe it without giving it away, then vote on who was bluffing.",
    howToPlay: [
      "Pass the phone — everyone peeks at the word, the spy gets nothing.",
      "Take turns describing the word without saying it.",
      "Vote on the spy. Spy escapes by guessing the word.",
    ],
    emoji: "🕵️",
    minPlayers: 3,
    sections: [
      {
        key: "words",
        label: "Words",
        hint: "One word or short phrase per line — this deck is the category.",
        placeholder: "Pizza\nSushi\nPancakes",
        minItems: 8,
      },
    ],
  },
  oddoneout: {
    slug: "oddoneout",
    title: "Odd One Out",
    tagline: "Think like the herd — or take the Pink Cow.",
    description:
      "Everyone secretly answers the same question. Match the group and score; stand alone and the Pink Cow is yours.",
    howToPlay: [
      "Pass the phone — everyone types an answer in secret.",
      "All answers are revealed at once.",
      "Matching the biggest group scores. Alone against a united room? Pink Cow.",
    ],
    emoji: "🐮",
    minPlayers: 3,
    sections: [
      {
        key: "questions",
        label: "Questions",
        hint: "One open question per line with lots of obvious answers.",
        placeholder:
          "Name a yellow fruit\nName something you find in a kitchen",
        minItems: 5,
      },
    ],
  },
  fibber: {
    slug: "fibber",
    title: "Fibber",
    tagline: "Invent the lie. Spot the truth.",
    description:
      "A real question with a real answer. Everyone writes a convincing fake, then the room votes — fool your friends and steal their points.",
    howToPlay: [
      "Pass the phone — everyone secretly writes a fake answer.",
      "All fakes are shuffled in with the real answer.",
      "Vote. Finding the truth scores 2; every player your fake fools scores you 1.",
    ],
    emoji: "🤥",
    minPlayers: 3,
    sections: [
      {
        key: "questions",
        label: "Questions",
        hint: 'One per line as "question | the real answer".',
        placeholder:
          "What is the world's smallest country? | Vatican City\nWhat is a group of crows called? | A murder",
        minItems: 5,
        validateEntry: {
          pattern: "^[^|]+\\|[^|]+$",
          message:
            'each line needs exactly one "|" between the question and its real answer',
        },
      },
    ],
  },
  partymode: {
    slug: "partymode",
    title: "Party Mode",
    tagline: "One endless deck that calls people out by name.",
    description:
      "Dares, challenges and rules dealt one at a time, with your friends' names dropped straight into them. Rules stick around until someone breaks them.",
    howToPlay: [
      "Add everyone playing, then hit deal.",
      "Do what the card says — it will name names.",
      "Rule cards stay active for a few rounds. Break one, take the punishment.",
    ],
    emoji: "🎉",
    minPlayers: 2,
    sections: [
      {
        key: "prompts",
        label: "Prompts",
        hint: "One per line. Use {player} and {player2} for names, {all} for everyone.",
        placeholder:
          "{player}, swap seats with {player2}\n{player} does their best impression of {player2}",
        minItems: 10,
      },
      {
        key: "rules",
        label: "Rules",
        hint: "One per line — these stay active for a few rounds.",
        placeholder:
          "Nobody may say the word 'drink'\n{player} must be addressed as Your Majesty",
        minItems: 3,
      },
    ],
  },
  doodlechain: {
    slug: "doodlechain",
    title: "Doodle Chain",
    tagline: "Draw it. Guess it. Watch it fall apart.",
    description:
      "A drawing game of telephone. One phone, passed around — each player sees only the step before theirs, and the whole chain is replayed at the end.",
    howToPlay: [
      "The first player gets a secret word and draws it.",
      "The next sees only the drawing and writes what it is.",
      "The next sees only that word and draws it. Repeat, then reveal.",
    ],
    emoji: "🎨",
    minPlayers: 3,
    sections: [
      {
        key: "words",
        label: "Words",
        hint: "One word or short phrase per line — drawable things work best.",
        placeholder: "Octopus\nBrushing your teeth\nA haunted house",
        minItems: 8,
      },
    ],
  },
};

export const TOOLS: ToolDef[] = [
  {
    slug: "spinthebottle",
    title: "Spin the Bottle",
    tagline: "Let the bottle decide.",
    emoji: "🍾",
    image: "/assets/spinthebottle/spinthebottle-cover.png",
    href: "/spinthebottle/play",
  },
  {
    slug: "diceroll",
    title: "Dice Roll",
    tagline: "Roll up to three dice, no table needed.",
    emoji: "🎲",
    image: "/assets/diceroll/diceroll-cover.webp",
    href: "/diceroll/play",
  },
];

export function isGameSlug(value: string): value is GameSlug {
  return (GAME_SLUGS as readonly string[]).includes(value);
}

export function getGame(slug: string): GameDef | null {
  return isGameSlug(slug) ? GAMES[slug] : null;
}

/** Empty content object with every section key of a game present. */
export function emptyContent(game: GameDef): DeckContent {
  return Object.fromEntries(game.sections.map((s) => [s.key, []]));
}
