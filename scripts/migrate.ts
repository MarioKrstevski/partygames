/**
 * Applies the generated SQL migrations in drizzle/ to DATABASE_URL.
 *
 * Used instead of `drizzle-kit migrate` so that applying migrations only needs
 * drizzle-orm at runtime — the same command works locally against Docker and in
 * a deploy step against Neon.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  console.log(`Migrating ${url.replace(/:[^:@]+@/, ":***@")}`);
  const client = postgres(url, { max: 1 });
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  await client.end();
  console.log("Migrations applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
