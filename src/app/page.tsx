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
  {
    title: "Truth or Dare",
    name: "truthordare",
    description:
      "A party game where players have to choose between truth or dare.",
    explanation:
      "Truth or Dare is a game where players choose between answering a question truthfully or performing a dare.",
    image: "/assets/truthordare/truthordare-cover.png",
  },
  {
    title: "Most Likely To",
    name: "mostlikelyto",
    description:
      "Chose the person who is most likely to do the action.",
    explanation:
      "Most Likely To is a game where players choose the person who is most likely to do the action.",
    image: "/assets/mostlikelyto/mostlikelyto-cover.png",
  },
  {
    title: "5 Seconds",
    name: "fiveseconds",
    description: "Answer the question in 5 seconds or drink.",
    explanation:
      "5 Seconds is a game where players have to answer the question in 5 seconds or drink.",
    image: "/assets/fiveseconds/fiveseconds-cover.webp",
  },
  {
    title: "Never Have I Ever",
    name: "neverhaveiever",
    description: "Go through the list of things you have never done.",
    explanation:
      "Never Have I Ever is a game where players go through the list of things they have never done.",
    image: "/assets/neverhaveiever/neverhaveiever-cover.png",
  },
  {
    title: "Spin the Bottle",
    name: "spinthebottle/play",
    description: "Spin the bottle",
    explanation:
      "Spin the Bottle is a game where players spin a bottle to determine who will perform a dare.",
    image: "/assets/spinthebottle/spinthebottle-cover.png",
  },
];
export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2  items-center sm:items-start">
        <h1 className="text-center">Select Game</h1>
        <ul className="flex gap-2 flex-wrap justify-center p-0 w-full px-2.5">
          {games.map((game: Game) => (
            <>
              <Link href={"/" + game.name}>
                <li
                  key={game.title}
                  className="flex border flex-col gap-2 items-center p-2 rounded-md hover:outline outline-2 outline-blue-300"
                >
                  <Image
                    className="object-cover"
                    src={game.image}
                    alt={game.title}
                    width={160}
                    height={160}
                  />
                  <h4 className="p-0 m-0">{game.title}</h4>
                  {/* <p>{game.description}</p> */}
                </li>
              </Link>
            </>
          ))}
        </ul>
      </main>
    </div>
  );
}
