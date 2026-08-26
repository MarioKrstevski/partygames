const MAX_NAME = 60;

/**
 * Pick a name for a copied deck that will not collide with the names the user
 * already has for that game — deck names are unique per user per game, so a
 * blind copy would be rejected by the database.
 *
 * "Road Trip" → "Road Trip (copy)" → "Road Trip (copy 2)" → …
 */
export function copyName(original: string, taken: string[]): string {
  const existing = new Set(taken.map((name) => name.toLowerCase()));
  if (!existing.has(original.toLowerCase())) return truncate(original);

  const base = original.replace(/\s*\(copy(?: \d+)?\)$/i, "");
  for (let n = 1; n < 500; n++) {
    const candidate = truncate(
      n === 1 ? `${base} (copy)` : `${base} (copy ${n})`,
    );
    if (!existing.has(candidate.toLowerCase())) return candidate;
  }
  // Practically unreachable; keeps the return type honest.
  return truncate(`${base} ${Date.now()}`);
}

/** Names are capped in the database, so trim the base rather than the suffix. */
function truncate(name: string): string {
  if (name.length <= MAX_NAME) return name;
  const suffix = name.match(/\s*\(copy(?: \d+)?\)$/i)?.[0] ?? "";
  const room = MAX_NAME - suffix.length;
  return name.slice(0, room).trimEnd() + suffix;
}
