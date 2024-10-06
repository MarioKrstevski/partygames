import prismadb from "@/lib/db";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";
import { MostLikelyToCategory } from "@prisma/client";

export default async function MostLikelyToPage() {
  const categories = await prismadb.mostLikelyToCategory.findMany({
    where: { isPublic: true },
  });
  const { user } = await validateRequest();
  return (
    <main className="container p-2">
      <h1>Most Likely To</h1>
      <p>
        Give the phone to the person who is most likely to do the
        thing on the screen.
        <br />
        You can create your own list of words to play with.
      </p>
      {user && (
        <Link href={"/mostlikelyto/new"}>
          <button>Create a category</button>
        </Link>
      )}
      <h2>Pick a category</h2>
      {categories.length === 0 && <p>Nothing found</p>}
      <ul>
        {categories.map((category: MostLikelyToCategory) => (
          <li key={category.id}>
            <a href={`/mostlikelyto/play/${category.id}`}>
              {category.name}
            </a>
            {user?.id === category.userId && (
              <a
                className="ml-3 text-yellow-300"
                href={`/mostlikelyto/edit/${category.id}`}
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
