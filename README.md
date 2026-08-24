# 🎉 Party Games

Every classic party game in one place, playable instantly in the browser. No app install, no account needed to play. Accounts unlock creating custom decks in any language and sharing them with your friend group.

**Games:** Charades · Truth or Dare · Most Likely To · 5 Seconds · Never Have I Ever · Boom It
**Quick tools:** Spin the Bottle · Dice Roll

## Stack

- [Next.js 14](https://nextjs.org) (App Router, server actions)
- [Drizzle ORM](https://orm.drizzle.team) on Postgres ([Neon](https://neon.tech) in production)
- [better-auth](https://better-auth.com) (email/password + username)
- Tailwind CSS

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run db:push        # sync schema to your database
npm run db:seed        # load starter decks for every game
npm run dev
```

`DATABASE_URL` can point at any Postgres — a local Docker container works fine:

```bash
docker run -d --name partygames-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17-alpine
```

Generate an auth secret with `openssl rand -base64 32`.

## Architecture notes

- **One `deck` table for all games.** Deck content is a `jsonb` map of section key → entries (e.g. Truth or Dare stores `{ truths: [...], dares: [...] }`). Which sections a game uses is declared in the game registry.
- **`src/lib/games.ts` is the game registry.** Titles, taglines, how-to-play copy, images, and deck content sections all live there. The `/[game]` routes (deck list, create, edit, play) are fully generic and driven by the registry — adding a new deck-based game means adding a registry entry, a play component in `src/components/games/`, and a line in the component registry.
- **Auth** is handled by better-auth (`src/lib/auth.ts`, route handler at `/api/auth/[...all]`). Use `getUser()` / `getSession()` in server code and `@/lib/auth-client` in client components.
- **Deck mutations** go through `src/app/actions/decks.ts` (zod-validated server actions with ownership checks).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to the database (dev) |
| `npm run db:generate` / `db:migrate` | Generate / apply SQL migrations |
| `npm run db:seed` | Seed public starter decks |
