# Party Games Modernization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking. (Subagent-driven execution is disabled for this project by user instruction.)

**Goal:** Move the Party Games app onto Next 16 + React 19 + Tailwind 4 + shadcn/ui + Drizzle on Postgres (Docker locally, Neon in production), using the uncommitted `../partygames` rewrite as the base, and land it on `main`.

**Architecture:** The rewrite's structure is kept intact — a game registry (`src/lib/games.ts`) drives generic `/[game]/{page,new,edit,play}` routes, all deck content lives in one `deck` table as jsonb keyed by section, and better-auth handles accounts. This plan ports that code into this worktree, then upgrades framework, styling and UI primitives in separate verifiable passes.

**Tech Stack:** Next 16.3.2, React 19.2, TypeScript 7.0.2, Tailwind CSS 4.3.3, shadcn/ui (CLI 4.x), Drizzle ORM 0.45 / drizzle-kit 0.31, postgres-js 3.4.9, better-auth 1.7.1, zod 4.4.3, Postgres 17-alpine in Docker.

**Spec:** `docs/superpowers/specs/2026-08-24-party-games-modernization-design.md`

**No automated tests in this pass** (spec decision 8). Every task therefore ends in an explicit build/lint/runtime verification step whose output must be read before moving on. Never mark a step done without seeing its output.

**Path shorthand used below:**
- `$WT` = `/Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e` (this worktree — all work happens here)
- `$SRC` = `/Users/mario/Documents/work/frex-solutions/our-projects/partygames` (the uncommitted rewrite — read-only until Task 9)

---

## File Structure

Files this plan creates or modifies in `$WT`, and what each is responsible for:

| Path | Responsibility |
| --- | --- |
| `docker-compose.yml` | **Create.** Local Postgres 17 with a named volume and healthcheck. |
| `.env.example` | **Create.** Documents `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAIL`. |
| `.env` | **Replace.** Old Supabase Prisma vars → local Docker connection string. Not committed. |
| `package.json` | **Replace then upgrade.** Deps and the `db:*` script set. |
| `next.config.mjs` | **Replace.** Empty config; the Lucia webpack externals die with Lucia. |
| `postcss.config.mjs` | **Modify.** `tailwindcss` plugin → `@tailwindcss/postcss`. |
| `tailwind.config.ts` | **Delete.** Tailwind 4 is configured in CSS. |
| `eslint.config.mjs` | **Create**, replacing `.eslintrc.json` (flat config for eslint-config-next 16). |
| `drizzle.config.ts` | **Create.** Points drizzle-kit at `src/lib/schema.ts`, out dir `drizzle/`. |
| `drizzle/` | **Create.** Generated SQL migrations, committed. |
| `src/lib/schema.ts` | **Create.** Drizzle schema: better-auth tables + `deck` + `deck_play`. |
| `src/lib/db.ts` | **Replace.** Prisma client → postgres-js + drizzle singleton. |
| `src/lib/auth.ts` | **Replace.** Lucia → better-auth; `getSession`/`getUser` helpers. |
| `src/lib/auth-client.ts` | **Create.** better-auth React client for client components. |
| `src/lib/decks.ts` | **Create.** Deck queries (visible decks, deck by id, ownership). |
| `src/lib/games.ts` | **Create.** Game registry — titles, taglines, how-to-play, images, content sections. |
| `src/lib/utils.ts` | **Replace.** `cn` + browser helpers, minus the Lucia cookie sniffing. |
| `src/app/layout.tsx` | **Modify.** Fonts + metadata + Header/Footer + Sonner toaster. |
| `src/app/globals.css` | **Replace.** Tailwind 4 `@import` + `@theme` design tokens. |
| `src/app/[game]/…` | **Create.** Generic deck list / new / edit / play routes (4 page files + 2 buttons). |
| `src/app/decks/page.tsx` | **Create.** Public deck browser across all games. |
| `src/app/admin/…` | **Create.** Admin deck moderation page, actions, toggle + delete buttons. |
| `src/app/actions/{decks,plays}.ts` | **Create.** Zod-validated server actions with ownership checks. |
| `src/app/api/auth/[...all]/route.ts` | **Create.** better-auth route handler. |
| `src/components/ui/` | **Create.** shadcn primitives. |
| `src/components/ui.tsx` | **Create then delete.** Ported hand-rolled primitives, removed in Task 7. |
| `src/components/games/` | **Create.** Six game components + `registry.tsx`. |
| `src/components/{Header,Footer,DeckForm,SignOutButton}.tsx` | **Create.** App chrome and the deck editor form. |
| `scripts/seed.ts` | **Create.** Seeds public starter decks for every game. |
| `README.md` | **Replace.** Setup, architecture notes, script table. |
| Deleted | `prisma/`, `src/app/{charades,truthordare,mostlikelyto,fiveseconds,neverhaveiever,boomit}/`, `src/app/actions/{auth,charades}.ts`, `src/app/global/`, `src/components/Form.tsx`, `.eslintrc.json` |

Not ported: `$SRC/src/app/lab/`, `$SRC/src/components/players/`, `$SRC/src/lib/players.ts`, `$SRC/src/_codux/`.

---

## Task 1: Preserve the `/lab` work before it can be lost

`$SRC` holds the only copy of the lab games, and they are uncommitted. This task
puts them on a branch so nothing depends on that folder staying untouched.

**Files:** none in `$WT` — this task operates only in `$SRC`.

- [ ] **Step 1: Confirm the lab files are still uncommitted and unique**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygames && git status --short -- src/app/lab src/components/players src/lib/players.ts
```

Expected: `??` or ` M` entries for those paths. If the output is empty, they were already committed — check `git log --oneline -3` and skip to Task 2.

- [ ] **Step 2: Commit the whole rewrite onto a `lab-experiments` branch**

Committing everything (not just lab) makes this branch a complete snapshot of the rewrite, which is a safety net for the whole port, not only for `/lab`.

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygames && git checkout -b lab-experiments && git add -A && git commit -m "Snapshot: drizzle/better-auth rewrite incl. lab games"
```

- [ ] **Step 3: Verify the snapshot contains the lab files**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygames && git show --stat HEAD -- src/app/lab src/components/players src/lib/players.ts | tail -20
```

Expected: the lab pages, `PlayerSetup.tsx`, `usePlayers.ts` and `lib/players.ts` all listed.

- [ ] **Step 4: Push the branch so it survives the folder being reset**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygames && git push -u origin lab-experiments
```

Expected: branch created on the remote. If the push is rejected for auth reasons, stop and report — do not continue to Task 9 (the reset) until this snapshot exists somewhere durable.

---

## Task 2: Port the rewrite into this worktree

Copy the rewrite in and delete everything it supersedes. Stack is still Next 14
at the end of this task — that is deliberate, so a later failure can be blamed on
the upgrade rather than the port.

**Files:** most of the repo — see the File Structure table.

- [ ] **Step 1: Delete the superseded Prisma/Lucia code**

```bash
rm -rf prisma src/app/charades src/app/truthordare src/app/mostlikelyto src/app/fiveseconds src/app/neverhaveiever src/app/boomit src/app/global src/app/actions src/components src/lib .eslintrc.json
```

- [ ] **Step 2: Copy the rewrite's source, excluding lab, players, codux and build output**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygames && rsync -a --exclude 'lab/' --exclude 'players/' --exclude 'players.ts' --exclude '_codux/' --exclude '.DS_Store' src/ /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e/src/
```

- [ ] **Step 3: Copy the root-level files**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygames && cp package.json tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts drizzle.config.ts .env.example README.md .gitignore /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e/ && rsync -a --exclude '.DS_Store' scripts/ /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e/scripts/
```

- [ ] **Step 4: Confirm no lab references survived the copy**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && grep -rn "lab/\|players/\|usePlayers\|@/lib/players" src || echo "CLEAN"
```

Expected: `CLEAN`. Anything else means a carried-over file still points at dropped code — fix the reference before continuing. (`src/components/Header.tsx` and `src/app/page.tsx` are the likely offenders, since both may link to `/lab`.)

- [ ] **Step 5: Commit the port**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add -A && git commit -m "Port drizzle/better-auth rewrite, drop Prisma/Lucia app"
```

---

## Task 3: Local Postgres in Docker

**Files:**
- Create: `docker-compose.yml`
- Modify: `.env`, `package.json` (scripts)

- [ ] **Step 1: Write `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:17-alpine
    container_name: partygames-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: partygames
    ports:
      - "5432:5432"
    volumes:
      - partygames-pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d partygames"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  partygames-pgdata:
```

- [ ] **Step 2: Point `.env` at the container**

Replace the file's Supabase Prisma vars entirely:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/partygames
BETTER_AUTH_SECRET=<output of: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAIL=macesmajli@gmail.com
```

Generate the secret with `openssl rand -base64 32` and paste the real value — better-auth throws at import time if it is empty. `.env` is gitignored; `.env.example` is the committed reference.

- [ ] **Step 3: Add the database scripts to `package.json`**

```json
"db:up": "docker compose up -d",
"db:down": "docker compose down",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio",
"db:seed": "tsx scripts/seed.ts"
```

- [ ] **Step 4: Start the database and verify it is healthy**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm run db:up && sleep 5 && docker compose ps
```

Expected: the `db` service listed as `running (healthy)`. If port 5432 is already taken by another local Postgres, stop that one or change the host port in both `docker-compose.yml` and `DATABASE_URL`.

- [ ] **Step 5: Commit**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add docker-compose.yml package.json && git commit -m "Add local Postgres via Docker Compose"
```

---

## Task 4: Baseline — install, migrate, seed, and confirm the ported app runs

**Files:** Create `drizzle/` (generated migrations).

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm install
```

Expected: completes. Node here is v24; Next 14 officially targets Node ≤22. **If `npm install` or the dev server fails specifically because of the Node version, skip the rest of this task and go straight to Task 5** — do not spend time repairing a stack that is about to be replaced. Note in the task log that the baseline was skipped.

- [ ] **Step 2: Generate the initial migration from the schema**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm run db:generate
```

Expected: `drizzle/0000_*.sql` plus `drizzle/meta/` written, covering `user`, `session`, `account`, `verification`, `deck`, `deck_play` and the `tier` / `game_type` enums.

- [ ] **Step 3: Apply it and seed**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm run db:migrate && npm run db:seed
```

Expected: migration applied, seed reports decks inserted. If the seed needs a user row that does not exist, read `scripts/seed.ts` and follow what it actually requires (it may create a system/owner user itself).

- [ ] **Step 4: Verify the data landed**

```bash
docker exec partygames-db psql -U postgres -d partygames -c "select game_type, count(*) from deck group by 1 order by 1;"
```

Expected: a row per game slug with a non-zero count.

- [ ] **Step 5: Boot the dev server and check one page renders**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm run dev
```

Run in the background, then load `http://localhost:3000` in the browser tool and confirm the landing page lists the games. Stop the server afterwards. This is the "port worked" checkpoint.

- [ ] **Step 6: Commit the migrations**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add drizzle package-lock.json && git commit -m "Add initial Drizzle migration"
```

---

## Task 5: Upgrade to Next 16, React 19, TypeScript 7

**Files:**
- Modify: `package.json`, `next.config.mjs`, `src/lib/auth.ts`, `src/app/[game]/page.tsx`, `src/app/[game]/new/page.tsx`, `src/app/[game]/edit/[id]/page.tsx`, `src/app/[game]/play/[id]/page.tsx`, `src/components/DeckForm.tsx`
- Create: `eslint.config.mjs`
- Delete: `.eslintrc.json` (if the port reintroduced it)

- [ ] **Step 1: Install the new framework versions**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm install next@16.3.2 react@19 react-dom@19 && npm install -D typescript@7 @types/react@19 @types/react-dom@19 eslint-config-next@16 eslint@9
```

- [ ] **Step 2: Make `params` awaited in all four `[game]` routes**

Next 15 turned `params` and `searchParams` into Promises. In each page, the props type becomes a Promise and the value is awaited:

```tsx
interface GamePageProps {
  params: Promise<{ game: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  ...
}

export default async function GamePage({ params }: GamePageProps) {
  const { game: slug } = await params;
  ...
}
```

`src/app/[game]/edit/[id]/page.tsx` and `play/[id]/page.tsx` take `Promise<{ game: string; id: string }>`. Note `generateMetadata` must become `async` and return `Promise<Metadata>` wherever it awaits params.

- [ ] **Step 3: Await `headers()` in `src/lib/auth.ts`**

`headers()` is async in Next 15+. Current code at `src/lib/auth.ts` passes it directly:

```ts
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
```

- [ ] **Step 4: Replace `useFormState` in `src/components/DeckForm.tsx`**

`useFormState` was removed from `react-dom` in React 19; the replacement lives in `react`:

```tsx
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
...
const [state, formAction] = useActionState(action, {});
```

`useFormStatus` stays in `react-dom` and is unchanged.

- [ ] **Step 5: Clean up `next.config.mjs`**

The Lucia argon2 externals and `experimental.serverActions` are both obsolete:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 6: Convert ESLint to flat config**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && rm -f .eslintrc.json
```

Create `eslint.config.mjs`:

```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends("next/core-web-vitals"),
  { ignores: [".next/**", "node_modules/**", "drizzle/**"] },
];
```

Install `@eslint/eslintrc` as a dev dependency if it is not already present.

- [ ] **Step 7: Typecheck, lint and build**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npx tsc --noEmit && npm run lint && npm run build
```

Expected: all three clean. Read every error rather than suppressing it — remaining failures here are almost always more unawaited `params`/`cookies()`/`headers()` call sites. **If TypeScript 7 itself is the problem** (crashes, or plugin incompatibilities that are not about our code), fall back with `npm install -D typescript@5.9` and record that the fallback was used.

- [ ] **Step 8: Commit**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add -A && git commit -m "Upgrade to Next 16, React 19, TypeScript 7"
```

---

## Task 6: Migrate to Tailwind 4

**Files:**
- Modify: `postcss.config.mjs`, `src/app/globals.css`, `package.json`
- Delete: `tailwind.config.ts`

- [ ] **Step 1: Swap the packages**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm uninstall tailwindcss && npm install -D tailwindcss@4 @tailwindcss/postcss@4
```

- [ ] **Step 2: Point PostCSS at the new plugin**

`postcss.config.mjs`:

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 3: Delete the JS config — Tailwind 4 is configured in CSS**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && rm tailwind.config.ts
```

- [ ] **Step 4: Rewrite `src/app/globals.css`**

Replaces the three `@tailwind` directives with the v4 import, and defines the shadcn token set in the app's existing violet-on-zinc palette. Dark is the only theme, so the tokens live on `:root` directly.

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  --color-background: oklch(0.15 0.03 300);
  --color-foreground: oklch(0.97 0.01 300);
  --color-card: oklch(0.21 0.03 300);
  --color-card-foreground: oklch(0.97 0.01 300);
  --color-popover: oklch(0.19 0.03 300);
  --color-popover-foreground: oklch(0.97 0.01 300);
  --color-primary: oklch(0.55 0.24 295);
  --color-primary-foreground: oklch(0.99 0 0);
  --color-secondary: oklch(0.28 0.03 300);
  --color-secondary-foreground: oklch(0.97 0.01 300);
  --color-muted: oklch(0.28 0.03 300);
  --color-muted-foreground: oklch(0.72 0.02 300);
  --color-accent: oklch(0.32 0.05 300);
  --color-accent-foreground: oklch(0.97 0.01 300);
  --color-destructive: oklch(0.58 0.22 27);
  --color-destructive-foreground: oklch(0.99 0 0);
  --color-border: oklch(0.35 0.03 300 / 40%);
  --color-input: oklch(0.35 0.03 300 / 40%);
  --color-ring: oklch(0.62 0.19 295);

  --radius: 0.75rem;
}

body {
  color: var(--color-foreground);
  background:
    radial-gradient(1000px 500px at 80% -10%, rgba(124, 58, 237, 0.25), transparent),
    radial-gradient(800px 400px at 10% 110%, rgba(236, 72, 153, 0.15), transparent),
    var(--color-background);
  min-height: 100dvh;
}
```

The exact oklch values are a starting point — Step 6 is where they get corrected against the real rendering.

- [ ] **Step 5: Build**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm run build
```

Expected: clean. Tailwind 4 removed some v3 utility names — if the build or the rendered page shows missing styles, the usual suspects are `shadow-sm`/`shadow`, `rounded-sm`/`rounded`, `outline-none`, and opacity shorthands like `bg-white/5` inside arbitrary values.

- [ ] **Step 6: Look at the app and compare against the old rendering**

Run `npm run dev`, then in the browser tool load `/`, one game page, `/decks`, and `/diceroll/play`. The dice must still animate in 3D — `src/app/diceroll/play/diceroll.css` is hand-written and its keyframes/transforms are the most likely casualty of v4's layer ordering. Fix any regressions before committing.

- [ ] **Step 7: Commit**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add -A && git commit -m "Migrate to Tailwind 4 with CSS-first config"
```

---

## Task 7: Adopt shadcn/ui

**Files:**
- Create: `components.json`, `src/components/ui/*` (generated)
- Modify: the 18 files importing `@/components/ui`, `src/app/layout.tsx`
- Delete: `src/components/ui.tsx`

- [ ] **Step 1: Initialise shadcn**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npx shadcn@latest init
```

Choose the defaults matching this repo: TypeScript, `src/` directory, `@/components` and `@/lib/utils` aliases, CSS variables enabled, base colour neutral. It will offer to rewrite `globals.css` — let it, then re-apply the violet palette from Task 6 Step 4 on top of whatever token block it generates, keeping its variable names.

- [ ] **Step 2: Add the components**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npx shadcn@latest add button card input textarea label badge select dropdown-menu alert-dialog sonner
```

- [ ] **Step 3: Verify the shadcn build works before touching call sites**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm run build
```

Expected: clean, with both `@/components/ui` (old file) and `@/components/ui/*` (new dir) present. If the two collide in module resolution, delete `src/components/ui.tsx` first and do Step 4 in the same pass.

- [ ] **Step 4: Replace the primitives across all call sites**

18 non-lab files import `@/components/ui`. Mapping:

| Old | New |
| --- | --- |
| `<Button variant="primary">` | `<Button>` (shadcn default) |
| `<Button variant="secondary">` | `<Button variant="secondary">` |
| `<Button variant="danger">` | `<Button variant="destructive">` |
| `<Button variant="ghost">` | `<Button variant="ghost">` |
| `<ButtonLink href={x}>` | `<Button asChild><Link href={x}>…</Link></Button>` |
| `<Card>` | `<Card>` + `<CardHeader>`/`<CardContent>` where the content has a clear header |
| `<Input>` / `<Textarea>` / `<Label>` | shadcn equivalents (same props) |
| `<TierBadge tier={t}>` | `<Badge>` with a tier→variant/className map |
| `<PageContainer>` | keep — move it into `src/components/layout.tsx` as a plain wrapper |

Work file by file, building after every few files rather than all 18 at once. `<Card>` in the old version had padding baked in (`p-5`); shadcn's does not distribute padding the same way, so check spacing visually on `/`, `/[game]` and `/decks`.

- [ ] **Step 5: Delete the old primitives file**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && rm src/components/ui.tsx && grep -rn '"@/components/ui"' src || echo "NO STALE IMPORTS"
```

Expected: `NO STALE IMPORTS`.

- [ ] **Step 6: Replace the native `confirm()` with `AlertDialog`**

`src/app/admin/DeleteDeckButton.tsx` currently calls `confirm(...)` inside its click handler. Convert it to an `AlertDialog` whose action button runs the existing `startTransition(() => adminDeleteDeck(deckId, gameSlug))`. Do the same for `src/app/[game]/edit/[id]/DeleteDeckButton.tsx` if it also confirms natively.

- [ ] **Step 7: Add the toaster and wire deck feedback**

Add `<Toaster />` (from `@/components/ui/sonner`) to `src/app/layout.tsx` inside `<body>`, and fire a toast on successful deck create/edit/delete. Keep the inline `role="alert"` error block in `DeckForm` for validation errors — toasts are for confirmations, not for form errors the user must act on.

- [ ] **Step 8: Convert the language and tier pickers to `Select`**

`src/components/DeckForm.tsx` uses a raw `<select>` with hand-written classes for language. Replace with shadcn `Select`. Because `Select` does not submit a value in a plain form POST, back it with a hidden input bound to the selected value so the existing server action keeps receiving `language` from `FormData` unchanged.

- [ ] **Step 9: Give the header a `DropdownMenu` account menu**

In `src/components/Header.tsx`, put the signed-in user's actions (My decks, Admin when applicable, Sign out) behind a `DropdownMenu` instead of inline links.

- [ ] **Step 10: Build, lint, typecheck**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npx tsc --noEmit && npm run lint && npm run build
```

Expected: all clean.

- [ ] **Step 11: Commit**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add -A && git commit -m "Replace hand-rolled UI primitives with shadcn/ui"
```

---

## Task 8: Full click-through verification

No automated tests exist, so this is the real safety net. Use the browser tool
and record what is actually observed for each item — a failure here is a finding,
not something to paper over.

**Files:** none (fixes go into whichever file is at fault, committed separately).

- [ ] **Step 1: Start clean**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npm run db:up && npm run db:migrate && npm run db:seed && npm run dev
```

- [ ] **Step 2: Walk the anonymous paths**

Landing page lists all games and tools · each of the six game pages shows how-to-play and seeded decks · a deck plays through several prompts for all six games · `/decks` lists public decks with tier badges · `/diceroll/play` rolls and animates · `/spinthebottle/play` spins and lands · `/not-found` and error boundaries render.

- [ ] **Step 3: Walk the account paths**

Sign up a new account · sign out · sign back in · create a deck (validation error shows when a section is under `minItems`) · play the created deck · edit it · delete it via the AlertDialog.

- [ ] **Step 4: Walk the admin path**

Sign in as the `ADMIN_EMAIL` account (check how `src/app/admin/page.tsx` gates access and promote the user in the database if it reads `user.role`: `docker exec partygames-db psql -U postgres -d partygames -c "update \"user\" set role='admin' where email='macesmajli@gmail.com';"`) · `/admin` lists decks · toggle public · delete a deck.

- [ ] **Step 5: Check the console for errors**

Read browser console output across the pages visited. Hydration errors and missing-key warnings are in scope to fix here.

- [ ] **Step 6: Commit any fixes**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add -A && git commit -m "Fix issues found in click-through verification"
```

---

## Task 9: Documentation, merge, and reconnect

**Files:** Modify `README.md`.

- [ ] **Step 1: Rewrite the README for the new stack**

Cover: what the app is; the stack with versions; local setup (`npm install`, `cp .env.example .env`, generate the auth secret, `npm run db:up`, `db:migrate`, `db:seed`, `dev`); moving to Neon (swap `DATABASE_URL`, run `db:migrate`); the architecture notes (registry-driven `[game]` routes, one jsonb deck table, server actions, better-auth); and the script table including the `db:*` set.

- [ ] **Step 2: Final full verification**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && npx tsc --noEmit && npm run lint && npm run build
```

Expected: all clean. Do not proceed on a failing build.

- [ ] **Step 3: Commit the README**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git add README.md && git commit -m "Update README for the modernized stack"
```

- [ ] **Step 4: Confirm the merge will fast-forward**

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git log --oneline origin/main -1 && git merge-base --is-ancestor origin/main HEAD && echo "FAST-FORWARD OK"
```

Expected: `FAST-FORWARD OK`. If not, `origin/main` moved — stop and report rather than forcing anything.

- [ ] **Step 5: Merge into `main` and push**

The worktree has `main` checked out elsewhere, so push the branch to `main` directly rather than switching branches:

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygamez/.claude/worktrees/party-games-modernize-275d4e && git push origin HEAD:main
```

Expected: fast-forward accepted. Then verify: `git log --oneline origin/main -3`.

- [ ] **Step 6: Ask before resetting `$SRC`**

`$SRC` still holds the now-superseded uncommitted rewrite. Its content is preserved on `lab-experiments` (Task 1) and its non-lab content is now on `main`. **Ask the user explicitly before running anything destructive there.** With approval:

```bash
cd /Users/mario/Documents/work/frex-solutions/our-projects/partygames && git checkout main && git fetch origin && git reset --hard origin/main && git clean -fd
```

Then confirm the folder matches: `git status --short` prints nothing, and `git log --oneline -1` matches `main`.

- [ ] **Step 7: Report**

State what landed, what was verified by actually running it, anything that failed or was skipped (the Node-24 baseline skip in Task 4, a TypeScript 5.9 fallback in Task 5), and what the next phase — new games, categories and decks — starts from.
