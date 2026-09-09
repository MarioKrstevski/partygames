import type { ShowcaseDeck } from "@/lib/decks";
import Scene from "./scenes";

/**
 * A phone-shaped frame around a live game scene. `depth` staggers the
 * entrance and the scroll drift so a group of frames reads as a stack.
 */
export default function PhoneFrame({
  slug,
  deck,
  depth = 1,
  drift = false,
  caption,
  className = "",
}: {
  slug: string;
  deck?: ShowcaseDeck;
  depth?: 1 | 2 | 3;
  /** Let the frame drift with scroll (hero only). */
  drift?: boolean;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`m-0 w-[58vw] shrink-0 snap-center sm:w-auto ${className}`}>
      <div className={`phone rise ${drift ? "drift" : ""}`} data-depth={depth}>
        <div className="phone-screen" aria-hidden="true">
          <Scene slug={slug} deck={deck} />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-xs font-medium text-zinc-400">{caption}</figcaption>
      )}
    </figure>
  );
}
