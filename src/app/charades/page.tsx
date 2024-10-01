import prismadb from "@/lib/db";
import { CharadeList } from "@prisma/client";
import Link from "next/link";
import CreateListButton from "./new/_components/CreateListButton";
import { validateRequest } from "@/lib/auth";

export default async function CharadesPage() {
  const games = await prismadb.charadeList.findMany({
    where: { isPublic: true },
  });
  const { user } = await validateRequest();
  return (
    <main className="container p-2">
      <h1>Charades</h1>
      <p>
        Charades is a game where players guess a word or phrase based
        on a silent performance by one player.
      </p>
      <CreateListButton />
      <h2>Pick a category</h2>
      {games.length === 0 && (
        <p>
          No games found. <br />{" "}
        </p>
      )}
      <ul>
        {games.map((game: CharadeList) => (
          <li key={game.id}>
            <a href={`/charades/${game.id}`}>{game.name}</a>
            <a
              className="ml-3 text-yellow-300"
              href={`/charades/edit/${game.id}`}
            >
              Edit
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
