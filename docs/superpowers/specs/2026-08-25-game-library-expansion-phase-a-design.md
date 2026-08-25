# Game Library Expansion — Phase A Design

Date: 2026-08-25
Branch: worktree `claude/party-games-modernize-275d4e` → fast-forward to `main`

## Context

Research into what party games people play in 2025–2026 found three dominant
threads: impostor-word social deduction tops every "one phone" list (Undercover,
Spyfall clones, Bluffin), the viral formula is zero learning curve plus a
built-in reaction moment, and player-aware prompts (Picolo's name injection) are
what make an app feel alive versus a static deck.

The repo already holds prototypes of the two hottest genres on the
`lab-experiments` branch (`793102c`): **Word Spy** (impostor-word), **Paranoia**
(whisper game, itself TikTok-trending), **Would You Rather** (evergreen
dilemmas), and a **player-roster engine** (`lib/players.ts`,
`components/players/`) that name-aware games require.

## Scope

Phase A of a three-phase expansion, agreed 2026-08-25:

- **Phase A (this spec):** roster infrastructure + the three lab games promoted
  into the main registry, fully deck-driven.
- **Phase B (later spec):** Odd One Out (Herd Mentality-style majority
  matching) and Fibber (Psych-style trivia bluffing) — both need a shared
  pass-around secret-input flow.
- **Phase C (later spec):** Party Mode, a Picolo-style session mixer with
  name-injected prompts and rule cards.

Games grid grows 6 → 9. Decisions: full deck-driven (not hardcoded-first);
Word Spy decks act as categories; emoji-tile covers instead of image assets.

## Design

### Schema

`game_type` is a Postgres enum. Migration `drizzle/0002_*.sql` adds
`wouldyourather`, `paranoia`, `wordspy` via `ALTER TYPE … ADD VALUE`
(PG 17 permits this inside the migration transaction; the values are first
used later, at seed time). No new tables — decks live in the existing `deck`
table.

### Content model

| Game | Section | Entry format | Seeded decks |
| --- | --- | --- | --- |
| Would You Rather | `dilemmas` | `option A \| option B` per line | Light / Medium / Spicy, ~40 each (lab content + new) |
| Paranoia | `questions` | one "Who here…" question per line | Light / Medium / Spicy (lab's wholesome/funny/spicy split becomes the tiers, expanded) |
| Word Spy | `words` | one word per line | One deck per lab category — Food, Places, Movies, Animals, Jobs, Sports, Household objects, … (the deck picker is the category picker; custom decks = custom categories) |

`ContentSection` (in `src/lib/games.ts`) gains an optional
`validateEntry: { pattern: RegExp; message: string }`, applied per line by
`parseContent` in `src/app/actions/decks.ts`, so a Would You Rather deck
missing the `|` separator fails in the editor with a clear message instead of
producing a broken card at play time.

### Roster infrastructure

Ported from `lab-experiments` essentially as-is, dropping only the lab route
prefix:

- `src/lib/players.ts` — localStorage roster; weighted "lucky" picking;
  boys-vs-girls pair bias with graceful fallback; round-robin asker via
  `pickPair`.
- `src/components/players/usePlayers.ts` — SSR-safe localStorage-synced state.
- `src/components/players/PlayerSetup.tsx` — inline roster editor, converted
  from `components/ui.tsx` primitives to shadcn (same mapping as the rest of
  the app).

No global players page. Paranoia and Word Spy render `PlayerSetup` inline when
the roster is below their minimum (3 players), as the lab versions did. The
roster persists across games. Would You Rather uses no roster.

### Game components

The three play components move to `src/components/games/` and adopt the
standard `{ deck: PlayableDeck }` prop, replacing their hardcoded content
arrays with parsed deck content. Word Spy's category-selection screen is
removed — the deck *is* the category. UI primitives convert to shadcn. Each
game gets a registry entry (title, tagline, how-to-play, emoji, sections) and
a line in `components/games/registry.tsx`.

### Covers

`GameDef.image` becomes optional. The home-page card and game page fall back
to a gradient tile with the game's emoji at display size when no image is set.
Existing games keep their images; new games ship with tiles. Real images can
be added later by setting the field.

### Testing

First test infrastructure in the repo (deferred from the modernization pass
until "genuinely new logic" — which this is): Vitest, minimal config, unit
tests for pure logic only:

- `lib/players.ts` — weighted picking distribution guards, boys-vs-girls bias
  and its fallbacks (untagged players, single-gender rosters), round-robin
  fairness.
- Dilemma / entry parsing — separator validation, malformed-line rejection.

Game components remain click-through-verified: all 9 games playable, deck
create/edit for each new game with a validation failure exercised, seeds
verified in the database, console clean.

### Out of scope

Phase B and C games; multi-device play; per-game images; roster use in the
six existing games; promoting `lab-experiments` content beyond these three.

## Verification

`npm run build`, lint, `tsc --noEmit`, `vitest run` all clean; migration
applies to the Docker database; seed produces the new decks; browser
click-through as above. Land on `main` by fast-forward push, same flow as the
modernization pass.
