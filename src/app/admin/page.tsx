import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getAllDecks, getDeckPlayCounts, getGamePlayCounts } from "@/lib/decks";
import { GAMES, GAME_SLUGS } from "@/lib/games";
import { ButtonLink, PageContainer } from "@/components/ui";
import TogglePublicButton from "./TogglePublicButton";
import DeleteDeckButton from "./DeleteDeckButton";
import type { Deck } from "@/lib/schema";

function isAdmin(email: string | null | undefined): boolean {
  return !!email && email === process.env.ADMIN_EMAIL;
}

function itemCount(deck: Deck): number {
  return Object.values(deck.content).reduce((sum, arr) => sum + arr.length, 0);
}

export const metadata = { title: "Admin — Deck Management" };

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/signin");
  if (!isAdmin(user.email)) redirect("/");

  const [allDecks, deckPlayCounts, gamePlayCounts] = await Promise.all([
    getAllDecks(),
    getDeckPlayCounts(),
    getGamePlayCounts(),
  ]);

  const totalDecks = allDecks.length;
  const publicDecks = allDecks.filter((d) => d.isPublic).length;

  const byGame = Object.fromEntries(
    GAME_SLUGS.map((slug) => [slug, allDecks.filter((d) => d.gameType === slug)]),
  ) as Record<string, Deck[]>;

  return (
    <PageContainer className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">Admin — Deck Management</h1>
        <span className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
          🔒 Admin only
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total decks" value={totalDecks} />
        <StatCard label="Public decks" value={publicDecks} />
        <StatCard label="Private decks" value={totalDecks - publicDecks} />
        <StatCard label="Games" value={GAME_SLUGS.length} />
      </div>

      {/* Per-game counts */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {GAME_SLUGS.map((slug) => (
          <div
            key={slug}
            className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-center"
          >
            <div className="text-lg">{GAMES[slug].emoji}</div>
            <div className="mt-0.5 text-xs font-medium text-zinc-300">{GAMES[slug].title}</div>
            <div className="text-xl font-bold">{byGame[slug].length}</div>
            <div className="text-xs text-zinc-500">
              {byGame[slug].filter((d) => d.isPublic).length} public
            </div>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {GAME_SLUGS.slice()
            .sort((a, b) => (gamePlayCounts[b] ?? 0) - (gamePlayCounts[a] ?? 0))
            .map((slug) => (
              <div
                key={slug}
                className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-center"
              >
                <div className="text-lg">{GAMES[slug].emoji}</div>
                <div className="mt-0.5 text-xs font-medium text-zinc-300">{GAMES[slug].title}</div>
                <div className="text-xl font-bold">{gamePlayCounts[slug] ?? 0}</div>
                <div className="text-xs text-zinc-500">plays</div>
              </div>
            ))}
        </div>
      </section>

      {/* Deck sections per game */}
      {GAME_SLUGS.map((slug) => {
        const game = GAMES[slug];
        const decks = byGame[slug];
        return (
          <section key={slug} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <span>{game.emoji}</span>
                <span>{game.title}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                  {decks.length}
                </span>
              </h2>
              <ButtonLink
                href={`/${slug}/new`}
                variant="secondary"
                className="text-xs"
              >
                + New deck
              </ButtonLink>
            </div>

            {decks.length === 0 ? (
              <p className="text-sm text-zinc-500">No decks yet.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-amber-400/20">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 bg-amber-400/5 text-xs text-zinc-400">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Name</th>
                      <th className="px-4 py-2.5 text-left font-medium">Visibility</th>
                      <th className="px-4 py-2.5 text-right font-medium">Items</th>
                      <th className="px-4 py-2.5 text-right font-medium">Plays</th>
                      <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {decks.map((d) => (
                      <tr key={d.id} className="bg-white/2 transition-colors hover:bg-white/5">
                        <td className="px-4 py-3 font-medium text-white">
                          {d.name}
                          {d.description && (
                            <span className="ml-2 text-xs font-normal text-zinc-500">
                              {d.description}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <TogglePublicButton deckId={d.id} isPublic={d.isPublic} />
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                          {itemCount(d)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-zinc-400">{deckPlayCounts[d.id] ?? 0} plays</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/${slug}/edit/${d.id}`}
                              className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/10"
                            >
                              Edit
                            </Link>
                            <DeleteDeckButton
                              deckId={d.id}
                              gameSlug={slug}
                              deckName={d.name}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </PageContainer>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-xs text-zinc-400">{label}</div>
    </div>
  );
}
