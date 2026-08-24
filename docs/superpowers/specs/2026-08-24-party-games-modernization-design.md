# Party Games — Stack Modernization Design

Date: 2026-08-24
Branch: `claude/party-games-modernize-275d4e`

## Context

`partygamez/` (this checkout) and `partygames/` are the **same repository** —
same remote (`MarioKrstevski/partygames`), same branch `main`, same HEAD commit
`6370352`. The difference is that `partygames/` carries a large **uncommitted**
rewrite in its working tree that was never committed or pushed.

| | `partygamez` (committed `main`) | `partygames` (uncommitted rewrite) |
| --- | --- | --- |
| Database | Prisma + Supabase, six near-identical `*Category` tables | Drizzle, one `deck` table with `jsonb` content, plus `deck_play` |
| Auth | Lucia + `@node-rs/argon2` | better-auth (email/password + username plugin) |
| Routes | One hand-written folder per game | Generic `/[game]/{new,edit,play}` driven by a registry |
| UI | Pico.css + Tailwind 3 utilities only | Tailwind 3 + hand-rolled `components/ui.tsx` |
| Extra | — | `/admin`, `/decks`, tier badges, play tracking, `/lab` games |

Neither is on the target stack: both run Next 14.2.13 and Tailwind 3, neither has
shadcn/ui, Neon, or a Docker setup.

## Goal

Bring the app onto the current stack — newest Next.js, Tailwind 4, shadcn/ui,
Drizzle, Postgres in Docker locally and Neon in production — while keeping the
existing games and their behaviour intact. This pass changes plumbing and
presentation, not gameplay. Expansion (new games, categories, decks) is a
separate phase that follows this one.

## Decisions

1. **Base is the `../partygames` rewrite.** Its architecture (generic `[game]`
   routes, game registry, single jsonb deck table) is the design we want; redoing
   it from the old per-game code would discard finished work and keep a schema
   with six duplicated tables.
2. **Land on `main` by fast-forward.** `main`'s HEAD is the commit this branch
   started from, so branch commits fast-forward cleanly. File contents on `main`
   are fully replaced; history is preserved; no force-push.
3. **Keep better-auth.** Already wired to the Drizzle schema and current.
4. **Carry over:** the 6 games, 2 tools, deck create/edit/play, the seed script,
   `/admin`, `/decks`, tier badges and play tracking.
   **Drop from this pass:** `/lab` (Would You Rather, Paranoia, Word Spy) and the
   `components/players/` + `lib/players.ts` roster engine, which only `/lab` uses.
5. **One database driver.** `postgres-js` over TCP everywhere; `DATABASE_URL`
   points at Docker in dev and Neon's pooled string in production. No runtime
   branching, identical behaviour in both environments.
6. **Generated SQL migrations.** `drizzle-kit generate` writes versioned files
   into `drizzle/` which are committed; `drizzle-kit migrate` applies them.
   `db:push` stays available for local experiments.
7. **Full shadcn/ui, existing dark look preserved.** Replace the hand-rolled
   primitives, but map the current violet-on-zinc palette onto shadcn's tokens so
   the app looks like it does today.
8. **No test infrastructure this pass.** No new business logic is being written
   and verification is a click-through of every screen. Tests come with the
   expansion phase.
9. **TypeScript 7.0.2** (latest stable). Fall back to 5.9 and say so if Next or
   ESLint tooling proves incompatible.

## Target stack

| Package | Version |
| --- | --- |
| next | 16.3.2 |
| react / react-dom | 19.2.x |
| typescript | 7.0.2 |
| tailwindcss + @tailwindcss/postcss | 4.3.3 |
| shadcn (CLI) | 4.x |
| drizzle-orm / drizzle-kit | 0.45 / 0.31 |
| better-auth | 1.7.1 |
| postgres (postgres-js) | 3.4.9 |
| zod | 4.4.3 |
| Postgres | 17-alpine (Docker) → Neon |

## Structure

```
src/app/     (auth)/{signin,signup}
             [game]/{page, new, edit/[id], play/[id]}
             decks · admin · diceroll/play · spinthebottle/play
             api/auth/[...all] · actions/{decks,plays}.ts
             layout · page · error · not-found
src/components/  ui/ (shadcn primitives)
                 games/ (6 game components + registry)
                 Header · Footer · DeckForm · SignOutButton
src/lib/     auth · auth-client · db · decks · games · schema · utils
drizzle/     generated SQL migrations
scripts/seed.ts
docker-compose.yml
```

All Prisma, Lucia, Pico.css and per-game route folders are deleted. Their
contents remain in git history on `main`.

## Work

### Preserve the lab work first

`/lab` and the roster engine exist only as uncommitted files in `../partygames`.
Before anything else, commit them to a `lab-experiments` branch so this pass can
drop them without destroying the only copy.

### Next 14 → 16 migration

Each of these is a confirmed breaking change present in the code:

- `params` is now a Promise — `await params` in the four `[game]` routes.
- `headers()` is async — `lib/auth.ts:getSession` currently passes it unawaited.
- `useFormState` → `useActionState` in `components/DeckForm.tsx`.
- `.eslintrc.json` → flat `eslint.config.mjs` for eslint-config-next 16.
- `next.config.mjs` — remove the `@node-rs/argon2` / `@node-rs/bcrypt` webpack
  externals (Lucia's, now dead) and the `experimental.serverActions` flag
  (stable since Next 14).

### Tailwind 4

Delete `tailwind.config.ts`; `postcss.config.mjs` uses `@tailwindcss/postcss`.
`globals.css` becomes `@import "tailwindcss"` plus an `@theme` block defining the
palette as oklch variables, dark as the default, no light mode for now. Verify
`diceroll.css` (3D dice transforms and keyframes) still renders correctly under
Tailwind 4's layer ordering.

### shadcn/ui mapping

| Current (`components/ui.tsx`) | Replacement |
| --- | --- |
| `Button`, `ButtonLink` | shadcn `Button` (+ `asChild` for links) |
| `Card` | shadcn `Card` |
| `Input`, `Textarea`, `Label` | shadcn equivalents |
| `TierBadge` | shadcn `Badge` with light/medium/spicy variants |
| `PageContainer` | stays a plain local layout helper |

Added: `AlertDialog` (replaces the `confirm()` in `admin/DeleteDeckButton.tsx`),
`Sonner` (deck save/delete toasts), `Select` (language and tier in `DeckForm`),
`DropdownMenu` (header account menu).

Game components keep their markup and behaviour; only their imported primitives
change.

### Database

Schema shape is unchanged: `deck` (jsonb content, tier, language, isPublic),
`deck_play`, and the four better-auth tables. Added:

- `docker-compose.yml` — `postgres:17-alpine`, named volume, healthcheck, 5432.
- An initial generated migration covering the whole schema.
- `.env.example` — `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- Scripts: `db:up`, `db:down`, `db:generate`, `db:migrate`, `db:push`,
  `db:seed`, `db:studio`.

Moving to Neon is a `DATABASE_URL` swap plus `npm run db:migrate`.

## Verification

1. `npm run build`, `npm run lint`, typecheck — all clean.
2. Docker up → migrate → seed → `npm run dev`.
3. Click-through in the browser: home; each of the six games (deck list → play);
   dice roll; spin the bottle; sign up; sign in; create deck; edit deck; delete
   deck; admin public toggle and delete.

Results are reported as observed, including anything that fails.

## Risks

- Next 16 and better-auth 1.7 interaction (async cookies/headers in the route
  handler).
- TypeScript 7 against Next and ESLint plugins — mitigated by the 5.9 fallback.
- Tailwind 4 layer ordering versus the hand-written `diceroll.css`.

## Out of scope

New games, categories and decks; `/lab`; internationalization; PWA/offline;
realtime multiplayer.

## Follow-up

Once merged, `../partygames` must be reset to match `main` — its uncommitted copy
would otherwise conflict with every future change. This happens only after
explicit confirmation.
