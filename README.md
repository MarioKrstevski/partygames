# 🎉 Party Games

Every classic party game in one place, playable instantly in the browser. No app install, no account needed to play. Accounts unlock creating custom decks in any language and sharing them with your friend group.

**Games:** Charades · Truth or Dare · Most Likely To · 5 Seconds · Never Have I Ever · Boom It · Would You Rather · Paranoia · Word Spy · Odd One Out · Fibber · Party Mode
**Quick tools:** Spin the Bottle · Dice Roll

## Stack

| | |
| --- | --- |
| [Next.js 16](https://nextjs.org) | App Router, server actions, Turbopack |
| [React 19](https://react.dev) | |
| [Tailwind CSS 4](https://tailwindcss.com) | CSS-first config — the theme lives in `src/app/globals.css` |
| [shadcn/ui](https://ui.shadcn.com) | Radix-based primitives in `src/components/ui/` |
| [Drizzle ORM](https://orm.drizzle.team) | Postgres via `postgres-js` |
| [better-auth](https://better-auth.com) | email/password + username |
| Postgres 17 | Docker locally, [Neon](https://neon.tech) in production |

## Local development

```bash
npm install
cp .env.example .env            # then fill in BETTER_AUTH_SECRET and ADMIN_EMAIL
npm run db:up                   # start Postgres in Docker (port 5437)
npm run db:migrate              # apply migrations
npm run db:seed                 # load starter decks for every game
npm run dev
```

Generate the auth secret with `openssl rand -base64 32` — better-auth throws at import time if `BETTER_AUTH_SECRET` is empty.

The database listens on **5437** rather than the default 5432, so it doesn't collide with other local Postgres containers. Change it in `docker-compose.yml` and `DATABASE_URL` together if you'd rather use another port.

## Going to Neon

Point `DATABASE_URL` at your Neon pooled connection string and run `npm run db:migrate`. There is no separate production driver — `postgres-js` talks to Docker and Neon the same way, so dev and production behave identically.

## Architecture notes

- **One `deck` table for all games.** Deck content is a `jsonb` map of section key → entries (Truth or Dare stores `{ truths: [...], dares: [...] }`, Charades stores `{ items: [...] }`). Which sections a game uses is declared in the game registry.
- **`src/lib/games.ts` is the game registry.** Titles, taglines, how-to-play copy, images, and deck content sections all live there. The `/[game]` routes (deck list, create, edit, play) are fully generic and driven by it — adding a deck-based game means adding a registry entry, a play component in `src/components/games/`, and a line in `src/components/games/registry.tsx`.
- **Auth** is better-auth (`src/lib/auth.ts`, route handler at `/api/auth/[...all]`). Use `getUser()` / `getSession()` in server code and `@/lib/auth-client` in client components. Admin access is by email — see `ADMIN_EMAIL` and `isAdminEmail()`.
- **Deck mutations** go through `src/app/actions/decks.ts` — zod-validated server actions with ownership checks. They redirect on success and carry a `?saved=` flag that `SavedToast` turns into a toast, because React 19 resets an uncontrolled form once its action settles.
- **Styling** is dark-only. The palette is defined once in `globals.css` using shadcn's token names, so shadcn components inherit the app's violet-on-zinc look without restyling.
- **Pass-the-phone infrastructure** lives in `src/components/players/`: a
  localStorage roster (`src/lib/players.ts`) shared across every game that
  names players, and `PassAroundInput` for collecting one secret entry per
  player (used by Odd One Out and Fibber).
- **Game logic is separated from components** where it has rules worth
  testing: `src/lib/oddoneout.ts` (herd scoring, Pink Cow), `src/lib/fibber.ts`
  (option building, Psych scoring), `src/lib/prompts.ts` (Party Mode name
  injection), `src/lib/dilemmas.ts`. These are unit-tested; the components are
  verified by playing them.
- **Migrations** are applied by `scripts/migrate.ts` rather than `drizzle-kit migrate`, so a deploy only needs `drizzle-orm` at runtime — and errors surface instead of being swallowed.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (flat config) |
| `npm test` | Vitest unit tests |
| `npm run db:up` / `db:down` | Start / stop the local Postgres container |
| `npm run db:generate` | Generate a SQL migration from `src/lib/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push the schema straight to the database (local experiments only) |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Seed public starter decks |
