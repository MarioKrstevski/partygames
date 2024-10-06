import prismadb from "@/lib/db";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";
import { BoomItCategory } from "@prisma/client";

export default async function MostLikelyToPage() {
  const categories = await prismadb.boomItCategory.findMany({
    where: { isPublic: true },
  });
  const { user } = await validateRequest();
  return (
    <main className="container p-2">
      <h1>Boom It</h1>
      <p>
        Like mosty likely to but with a twist.
        <br />
        You can create your own list of words to play with.
      </p>
      {user && (
        <Link href={"/boomit/new"}>
          <button>Create a category</button>
        </Link>
      )}
      <h2>Pick a category</h2>
      {categories.length === 0 && <p>Nothing found</p>}
      <ul>
        {categories.map((category: BoomItCategory) => (
          <li key={category.id}>
            <a href={`/boomit/play/${category.id}`}>
              {category.name}
            </a>
            {user?.id === category.userId && (
              <a
                className="ml-3 text-yellow-300"
                href={`/boomit/edit/${category.id}`}
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
