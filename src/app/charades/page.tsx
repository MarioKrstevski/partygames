import prismadb from "@/lib/db";
import Link from "next/link";

export default async function CharadesPage() {
  const games = await prismadb.charadeList.findMany({
    where: { isPublic: true },
  });
  return (
    <main className="container p-2">
      <h1>Charades</h1>
      <p>
        Charades is a game where players guess a word or phrase based
        on a silent performance by one player.
      </p>
      <h2>Pick a category</h2>
      {games.length === 0 && (
        <p>
          No games found. <br />{" "}
          <Link href={"/charades/new"}>
            <button>Create a List</button>
          </Link>{" "}
        </p>
      )}
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <a href={`/charades/${game.id}`}>{game.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
