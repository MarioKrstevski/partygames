import Image from "next/image";
import Link from "next/link";

interface Game {
  title: string;
  name: string;
  description: string;
  explanation: string;
  image: string;
}

const games: Game[] = [
  {
    title: "Charades",
    name: "charades",
    description: "A parlor or party word guessing game.",
    explanation:
      "Charades is a game where players guess a word or phrase based on a silent performance by one player.",
    image: "/assets/charades/charades-game-logo.png",
  },
];
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-center">Start your game</h1>
        <ul className="flex gap-2 flex-wrap">
          {games.map((game) => (
            <>
              <Link href={"/" + game.name}>
                <li
                  key={game.title}
                  className="flex border flex-col gap-4 items-center p-2 rounded-md hover:outline outline-2 outline-blue-300"
                >
                  <Image
                    src={game.image}
                    alt={game.title}
                    width={200}
                    height={200}
                  />
                  <h2>{game.title}</h2>
                  <p>{game.description}</p>
                </li>
              </Link>
            </>
          ))}
        </ul>
      </main>
    </div>
  );
}
