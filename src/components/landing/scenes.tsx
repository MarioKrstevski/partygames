import type { ReactNode } from "react";
import type { ShowcaseDeck } from "@/lib/decks";
import { depthGradient } from "@/lib/deeper";

/**
 * Live tiles for the landing page: each scene is the game's real play screen,
 * rebuilt from the same classes and fed the same seeded content, so the wall
 * shows the product rather than a picture of it. Names in the roster games are
 * illustrative.
 */

export interface SceneProps {
  slug: string;
  deck?: ShowcaseDeck;
}

const NAMES = ["Ana", "Marko", "Elena"];

function entry(deck: ShowcaseDeck | undefined, i = 0, fallback = "…"): string {
  return deck?.entries[i] ?? fallback;
}

function pair(deck: ShowcaseDeck | undefined, i = 0): [string, string] {
  const raw = entry(deck, i, " | ");
  const at = raw.indexOf("|");
  return at === -1 ? [raw, ""] : [raw.slice(0, at).trim(), raw.slice(at + 1).trim()];
}

function Screen({
  deck,
  exit = "Exit",
  className = "",
  children,
}: {
  deck?: ShowcaseDeck;
  exit?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex h-full w-full flex-col ${className}`}>
      <div className="flex items-center justify-between px-3 pt-3 text-[9px] text-zinc-400">
        <span className="truncate font-medium">{deck?.name ?? "Party Games"}</span>
        <span>{exit}</span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3">{children}</div>
    </div>
  );
}

function Btn({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "secondary" | "pink" }) {
  const tones = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    pink: "bg-pink-600 text-white",
  };
  return (
    <div className={`rounded-lg px-2 py-2 text-center text-[10px] font-semibold ${tones[tone]}`}>
      {children}
    </div>
  );
}

function Charades({ deck }: SceneProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <p className="pt-3 text-center text-sm font-bold text-violet-300 pg-tick">22</p>
      <div className="grid flex-1 grid-cols-[1fr_2.2fr_1fr] items-center">
        <div className="text-center text-[9px] font-semibold text-red-300">✗<br />Pass</div>
        <p className="px-1 text-center text-lg font-bold leading-tight">{entry(deck, 6, "Crab")}</p>
        <div className="text-center text-[9px] font-semibold text-emerald-300">✓<br />Got it</div>
      </div>
      <p className="pb-2 text-center text-[8px] text-zinc-500">End round</p>
    </div>
  );
}

function TruthOrDare({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <p className="text-[8px] text-zinc-500">Round 1</p>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-base font-bold">Truth or Dare?</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Btn>Truth</Btn>
        <Btn tone="pink">Dare</Btn>
      </div>
    </Screen>
  );
}

function MostLikelyTo({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <div className="flex flex-1 items-center">
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="text-[8px] font-semibold uppercase tracking-widest text-violet-300">Who is most likely to…</p>
          <p className="mt-2 text-sm font-bold leading-snug">{entry(deck, 9, "get kicked out of a library")}</p>
        </div>
      </div>
      <Btn>Next</Btn>
    </Screen>
  );
}

function FiveSeconds({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <p className="text-[8px] text-zinc-500">Card 1 of 30</p>
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-center text-sm font-bold leading-snug">{entry(deck, 10, "Name 3 famous duos")}</p>
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
            <circle cx="32" cy="32" r="28" className="fill-violet-600/40" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="#a78bfa" strokeWidth="4" strokeDasharray="176" className="pg-ring" />
          </svg>
          <span className="relative text-2xl font-bold pg-tick">5</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Btn>Nailed it</Btn>
        <Btn tone="secondary">Failed</Btn>
      </div>
    </Screen>
  );
}

function NeverHaveIEver({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <p className="text-[8px] text-zinc-500">1 / 30</p>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[8px] font-semibold uppercase tracking-widest text-violet-300">Never have I ever…</p>
        <p className="mt-2 text-sm font-bold leading-snug">{entry(deck, 14, "laughed so hard I snorted")}</p>
      </div>
      <Btn>Next</Btn>
    </Screen>
  );
}

function BoomIt({ deck }: SceneProps) {
  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-violet-950 via-violet-900 to-background text-foreground">
      <div className="flex flex-1 items-center justify-center px-3 text-center">
        <p className="text-sm font-bold leading-snug pg-bomb">{entry(deck, 3, "Name something you find in a bathroom")}</p>
      </div>
      <div className="px-3 pb-2">
        <Btn>Next prompt</Btn>
        <p className="mt-1 text-center text-[8px] text-zinc-400">Tick… tick… the bomb is live</p>
      </div>
    </div>
  );
}

function WouldYouRather({ deck }: SceneProps) {
  const [a, b] = pair(deck, 3);
  return (
    <Screen deck={deck}>
      <p className="text-center text-[10px] font-bold">Would you rather…</p>
      <div className="mt-2 flex flex-1 flex-col gap-1.5">
        <div className="flex flex-1 items-center justify-center rounded-xl border border-violet-400 bg-violet-600/40 p-2 text-center text-[11px] font-semibold leading-snug">{a}</div>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] p-2 text-center text-[11px] font-semibold leading-snug text-zinc-500">{b}</div>
      </div>
      <p className="mt-1 text-center text-[8px] font-medium text-violet-300">Bold choice!</p>
    </Screen>
  );
}

function Paranoia({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <div className="flex flex-1 items-center">
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="text-[8px] font-semibold uppercase tracking-widest text-violet-300">Your secret question</p>
          <p className="mt-2 text-sm font-bold leading-snug">{entry(deck, 2, "Who here gives the best hugs?")}</p>
          <p className="mt-2 text-[8px] text-zinc-400">Whisper this to <span className="font-semibold text-white">{NAMES[1]}</span></p>
        </div>
      </div>
      <Btn>Done whispering</Btn>
    </Screen>
  );
}

function WordSpy({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <p className="text-center text-[10px] font-semibold">{NAMES[2]}</p>
      <div className="mt-2 flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-black/30 p-3 text-center">
        <div>
          <p className="text-[8px] text-zinc-400">The secret word is</p>
          <p className="mt-1 text-lg font-bold text-violet-300">{entry(deck, 1, "Octopus")}</p>
        </div>
      </div>
      <div className="mt-2">
        <Btn>Hold to reveal</Btn>
      </div>
    </Screen>
  );
}

function OddOneOut({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <p className="text-[10px] font-bold leading-snug">{entry(deck, 0, "Name a yellow fruit")}</p>
      <div className="mt-2 rounded-xl border border-pink-400/40 bg-pink-500/10 p-2 text-center">
        <p className="text-[10px] font-bold text-pink-200">{NAMES[2]} takes the Pink Cow!</p>
        <p className="text-[8px] text-pink-200/80">Everyone else agreed. They did not.</p>
      </div>
      <ul className="mt-2 space-y-1 text-[9px]">
        <li className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-2 py-1"><span className="font-semibold">Banana</span><span className="text-zinc-400">×2</span></li>
        <li className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-2 py-1"><span className="font-semibold">Lemon</span><span className="text-zinc-400">×1</span></li>
      </ul>
    </Screen>
  );
}

function Fibber({ deck }: SceneProps) {
  const [q, a] = pair(deck, 0);
  return (
    <Screen deck={deck}>
      <p className="text-center text-[8px] font-semibold uppercase tracking-widest text-violet-300">{NAMES[0]}, which one is true?</p>
      <p className="mt-1 text-center text-[10px] font-bold leading-snug">{q}</p>
      <div className="mt-2 flex flex-1 flex-col justify-center gap-1">
        {["Monaco", a, "Malta"].map((o, i) => (
          <div key={o + i} className={`rounded-lg px-2 py-1.5 text-[9px] font-semibold ${i === 1 ? "bg-secondary" : "bg-white/5 text-zinc-300"}`}>{o}</div>
        ))}
      </div>
    </Screen>
  );
}

function PartyMode({ deck }: SceneProps) {
  const text = entry(deck, 0, "{player}, swap seats with {player2}")
    .replace(/\{player2\}/g, NAMES[1])
    .replace(/\{player\}/g, NAMES[0])
    .replace(/\{all\}/g, NAMES.join(", "));
  return (
    <Screen deck={deck}>
      <div className="flex flex-1 items-center">
        <div className="w-full rounded-2xl border border-violet-400/30 bg-gradient-to-b from-violet-600/25 to-pink-500/10 p-3 text-center">
          <p className="text-[8px] font-semibold uppercase tracking-widest text-violet-300">Your card</p>
          <p className="mt-2 text-sm font-bold leading-snug">{text}</p>
        </div>
      </div>
      <Btn>Next card →</Btn>
    </Screen>
  );
}

function DoodleChain({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <p className="text-center text-[9px] font-semibold text-violet-300">{NAMES[1]}, what is this?</p>
      <div className="mt-2 aspect-[4/3] w-full rounded-xl border border-white/15 bg-[#f8f7fb] p-2">
        <svg viewBox="0 0 120 90" className="h-full w-full" fill="none" stroke="#1c1523" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path className="pg-draw" d="M20 78V40L60 14l40 26v38H20Z" />
          <path className="pg-draw" d="M50 78V56h20v22" />
          <path className="pg-draw" d="M28 46l8 8M84 46l8 8" stroke="#7c3aed" />
        </svg>
      </div>
      <div className="mt-2 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-[9px] text-zinc-500">One word or a short phrase…</div>
    </Screen>
  );
}

function Forbidden({ deck }: SceneProps) {
  const [word, banned] = pair(deck, 0);
  return (
    <Screen deck={deck}>
      <div className="flex items-center justify-between text-[8px] text-zinc-400"><span>Team Violet</span><span className="font-bold text-white pg-tick">41s</span></div>
      <div className="mt-2 flex flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 text-center">
        <p className="text-base font-bold">{word || "Beach"}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {(banned || "sand, sea, sun").split(",").slice(0, 4).map((b) => (
            <span key={b} className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[8px] font-semibold text-red-300 line-through">{b.trim()}</span>
          ))}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5"><Btn>Got it</Btn><Btn tone="secondary">Pass</Btn></div>
    </Screen>
  );
}

function Wavelength({ deck }: SceneProps) {
  const [left, right] = pair(deck, 0);
  return (
    <Screen deck={deck}>
      <p className="text-center text-[8px] font-semibold uppercase tracking-widest text-violet-300">Where is the target?</p>
      <div className="mt-3 flex justify-between text-[9px] font-semibold"><span className="text-violet-300">{left || "Overrated"}</span><span className="text-pink-300">{right || "Underrated"}</span></div>
      <div className="relative mt-1 h-6 overflow-hidden rounded-lg border border-white/15 bg-gradient-to-r from-violet-600/40 via-white/5 to-pink-500/40">
        <div className="absolute inset-y-0 left-[62%] w-[22%] rounded bg-emerald-400/40" />
        <div className="absolute inset-y-0 left-[70%] w-[7%] rounded bg-emerald-400/80" />
        <div className="absolute inset-y-0 w-0.5 rounded bg-white shadow pg-needle" />
      </div>
      <div className="mt-auto"><Btn>Lock it in</Btn></div>
    </Screen>
  );
}

function Deeper({ deck }: SceneProps) {
  const rungs = entry(deck, 0, "a > b > c").split(">").map((r) => r.trim());
  const level = Math.min(2, rungs.length - 1);
  return (
    <div className="flex h-full w-full flex-col text-white" style={{ background: depthGradient(level, rungs.length) }}>
      <div className="flex gap-1 px-3 pt-3">
        {rungs.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= level ? "bg-white/90" : "bg-white/15"}`} />)}
      </div>
      <p className="mt-1 px-3 text-right text-[7px] font-semibold uppercase tracking-widest text-white/70">Too far</p>
      <div className="flex flex-1 items-center px-3 text-center">
        <p className="w-full text-sm font-bold leading-snug">{rungs[level]}</p>
      </div>
      <div className="px-3 pb-3"><Btn>Deeper</Btn></div>
    </div>
  );
}

function FlipSide({ deck }: SceneProps) {
  return (
    <Screen deck={deck}>
      <div className="rounded-2xl border border-violet-400/30 bg-gradient-to-b from-violet-600/25 to-pink-500/10 p-3 text-center">
        <p className="text-[8px] font-semibold uppercase tracking-widest text-violet-300">Agree or disagree?</p>
        <p className="mt-1 text-sm font-bold leading-snug">{entry(deck, 5, "Cereal is a soup")}</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-4xl font-extrabold pg-tick">3</p>
        <p className="text-[8px] text-zinc-400">Everyone shouts at once</p>
      </div>
    </Screen>
  );
}

function SpinTheBottle() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative, tiny */}
      <img src="/assets/spinthebottle/bottle.png" alt="" className="h-28 w-auto pg-spin" />
      <p className="mt-3 text-[9px] font-semibold text-zinc-300">Tap to spin</p>
    </div>
  );
}

function DiceRoll() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="grid h-16 w-16 grid-cols-3 grid-rows-3 gap-1 rounded-xl bg-white p-2 shadow-lg pg-bomb">
        {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((on, i) => <span key={i} className={`rounded-full ${on ? "bg-red-500" : ""}`} />)}
      </div>
      <p className="mt-3 text-[9px] font-semibold text-zinc-300">Roll dice</p>
    </div>
  );
}

const SCENES: Record<string, (p: SceneProps) => ReactNode> = {
  charades: Charades,
  truthordare: TruthOrDare,
  mostlikelyto: MostLikelyTo,
  fiveseconds: FiveSeconds,
  neverhaveiever: NeverHaveIEver,
  boomit: BoomIt,
  wouldyourather: WouldYouRather,
  paranoia: Paranoia,
  wordspy: WordSpy,
  oddoneout: OddOneOut,
  fibber: Fibber,
  partymode: PartyMode,
  doodlechain: DoodleChain,
  forbidden: Forbidden,
  wavelength: Wavelength,
  deeper: Deeper,
  flipside: FlipSide,
  spinthebottle: SpinTheBottle,
  diceroll: DiceRoll,
};

export default function Scene(props: SceneProps) {
  const Component = SCENES[props.slug];
  return Component ? <Component {...props} /> : null;
}
