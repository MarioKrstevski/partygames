"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { ShowcaseDeck } from "@/lib/decks";
import Scene from "./scenes";

export interface WallTile {
  key: string;
  slug: string;
  href: string;
  title: string;
  meta: string;
  line: string;
  deck?: ShowcaseDeck;
}

export interface WallRow {
  id: string;
  title: string;
  tiles: WallTile[];
  /** A trailing link at the row's right edge. */
  more?: { href: string; label: string };
}

/**
 * The catalog wall: horizontal rails of live game tiles. The focused tile
 * comes forward and reveals what it is; its row lifts and the rest dim. Rows
 * mark themselves live while on screen so the scenes only animate when seen.
 */
export default function GameWall({ rows }: { rows: WallRow[] }) {
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const rowEls = wall.querySelectorAll<HTMLElement>("[data-row]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          (e.target as HTMLElement).dataset.live = e.isIntersecting ? "true" : "false";
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    rowEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function nudge(rail: HTMLElement | null, dir: 1 | -1) {
    rail?.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div ref={wallRef} className="wall space-y-8">
      {rows.map((row) => (
        <section key={row.id} data-row data-live="false" className="row" aria-labelledby={`row-${row.id}`}>
          <div className="mx-auto flex w-full max-w-6xl items-end justify-between px-4 sm:px-6">
            <h2
              id={`row-${row.id}`}
              className="text-sm font-extrabold uppercase tracking-[0.08em] text-white sm:text-base"
            >
              {row.title}
            </h2>
            <div className="flex items-center gap-3">
              {row.more && (
                <Link
                  href={row.more.href}
                  className="text-xs font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {row.more.label}
                </Link>
              )}
              <div className="hidden gap-1 sm:flex">
                <RailButton
                  label={`Scroll ${row.title} left`}
                  onClick={(e) => nudge(e.currentTarget.closest("section")?.querySelector("[data-rail]") ?? null, -1)}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3 5 8l5 5" /></svg>
                </RailButton>
                <RailButton
                  label={`Scroll ${row.title} right`}
                  onClick={(e) => nudge(e.currentTarget.closest("section")?.querySelector("[data-rail]") ?? null, 1)}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                </RailButton>
              </div>
            </div>
          </div>

          <ul data-rail className="rail mt-4">
            {row.tiles.map((tile) => (
              <li key={tile.key} className="tile-slot">
                <Link href={tile.href} className="tile" aria-label={`${tile.title} — ${tile.meta}`}>
                  <div className="tile-screen" aria-hidden="true">
                    <Scene slug={tile.slug} deck={tile.deck} />
                  </div>
                  <div className="tile-sheet">
                    <p className="text-sm font-bold leading-tight text-white">{tile.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-300">{tile.meta}</p>
                    <p className="tile-line mt-1.5 text-xs leading-snug text-zinc-200">{tile.line}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-white/40 hover:text-white"
    >
      {children}
    </button>
  );
}
