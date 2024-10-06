import prismadb from "@/lib/db";
import { CharadeList, FiveSecondsCategory } from "@prisma/client";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";

export default async function FiveSecondsPage() {
  const categories = await prismadb.fiveSecondsCategory.findMany({
    where: { isPublic: true },
  });
  const { user } = await validateRequest();
  return (
    <main className="container p-2">
      <h1>5 Seconds</h1>
      <p>
        5 Seconds is a game where have 5 seconds to come up with
        answers for the qusetions
        <br />
        You can create your own list of words to play with.
      </p>
      {user && (
        <Link href={"/fiveseconds/new"}>
          <button>Create a category</button>
        </Link>
      )}
      <h2>Pick a category</h2>
      {categories.length === 0 && <p>Nothing found</p>}
      <ul>
        {categories.map((category: FiveSecondsCategory) => (
          <li key={category.id}>
            <a href={`/fiveseconds/play/${category.id}`}>
              {category.name}
            </a>
            {user?.id === category.userId && (
              <a
                className="ml-3 text-yellow-300"
                href={`/fiveseconds/edit/${category.id}`}
              >
                Edit
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
