# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally (confirmed 2026-09-09):

1. **People who do not know each other yet** — new flatmates, a first week at
   university, a mixed table at a party, a team offsite. Their job is to break
   the ice and get comfortable fast without anyone having to perform as host.
2. **Friends with half an hour to fill** — a group that already knows each
   other and wants something to do right now, with zero setup.

In both scenes the situation is the same: several people, one phone, no
preparation, and usually no reliable wifi. The phone gets passed around or sits
in the middle of the table.

## Product Purpose

Every classic party game in one place, playable instantly in the browser on
one phone. No install and no account to play. Accounts exist only to create
custom decks and share them with a friend group.

Success is a group playing within seconds of opening the page, and a night
that keeps going without anyone reaching for a different app.

## Positioning

- **One phone, seventeen games, zero setup.** Most competitors ship one game
  each; this is a library with a shared player roster, shared freshness
  memory, and a night planner that sequences an evening across games.
- **Decks in your own language, for your own people.** Custom decks in any
  language, shareable by link and QR, copyable into a friend's account. The
  built-in decks are the floor, not the product.
- **Works when the wifi does not.** Once opened, a game keeps working
  offline; the app installs to the home screen.

## Operating Context

- Played in living rooms, kitchens, hostels, dorms, bars, and offsites.
- One device shared by 2–20 people; games declare a player range and length.
- Games are grouped by heat: light (sober-friendly), medium (personal), spicy
  (adults only). Every deck carries a tier.
- Player roster and "seen cards" live in the phone's local storage; nothing
  about a night is sent to a server.

## Capabilities and Constraints

- 17 games: Charades, Truth or Dare, Most Likely To, 5 Seconds, Never Have I
  Ever, Boom It, Would You Rather, Paranoia, Word Spy, Odd One Out, Fibber,
  Party Mode, Doodle Chain, Forbidden, Wavelength, Deeper, Flip Side. Two quick
  tools: Spin the Bottle, Dice Roll.
- 55+ seeded public decks; users create their own (100 per account).
- Plan tonight (`/tonight`): group size + vibe + length → a paced running
  order across games.
- Deck sharing (`/d/[token]`): link and QR; plays without an account; signed-in
  visitors save a copy.
- Offline via service worker; installable (manifest + generated icons).
- Real play counts exist (`deck_play` table, `getGamePlayCounts()`); traffic
  is currently low, so any "most played" ordering needs a curated fallback.
- Stack: Next 16, React 19, Tailwind 4, shadcn/ui, Drizzle on Postgres.

## Brand Commitments

- Name: **Party Games**.
- Voice: direct, warm, a little cheeky; second person; short sentences.
- Confirmed anti-commitments for the landing page (2026-09-09): the emoji-led
  presentation reads as generic and AI-made and is not to be carried forward
  on the marketing surface; "Pick your poison" as a heading is retired.
- The in-app game screens keep their current visual system; the landing page
  is the surface being redesigned.

## Evidence on Hand

- **Real product only.** No testimonials, user counts, press, or logos exist,
  and none may be invented (confirmed 2026-09-09). Slots for real quotes may
  be added later; no placeholder praise.
- Real game screenshots can be captured from the running app for use as
  imagery.
- Real seeded decks, including (to be authored for this surface) a French deck
  and a Spanish deck, both public and playable.
- Cover art exists for the six original games under `public/assets/`; the
  eleven newer games have none.

## Product Principles

1. Playing within seconds beats explaining. The fastest proof is a game on
   screen.
2. The group is the content. The app conducts; the people supply the fun.
3. Your language, your people. Custom decks are the reason to come back.
4. Never depend on the venue's wifi or on anyone downloading anything.
5. Claim nothing the product cannot demonstrate on the page.
