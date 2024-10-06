import prismadb from "@/lib/db";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";
import { NeverHaveIEverCategory } from "@prisma/client";

export default async function NeverHaveIEverPage() {
  const categories = await prismadb.neverHaveIEverCategory.findMany({
    where: { isPublic: true },
  });
  const { user } = await validateRequest();
  return (
    <main className="container p-2 h-[calc(100vh_-_40px)] ">
      <h1>Never Have I Ever</h1>
      <p>
        Start with 5 fingers up. Put one down for every thing you have
        done one of the statements.
        <br />
        You can create your own list of words to play with.
      </p>
      {user && (
        <Link href={"/neverhaveiever/new"}>
          <button>Create a category</button>
        </Link>
      )}
      <h2>Pick a category</h2>
      {categories.length === 0 && <p>Nothing found</p>}
      <ul>
        {categories.map((category: NeverHaveIEverCategory) => (
          <li key={category.id}>
            <a href={`/neverhaveiever/play/${category.id}`}>
              {category.name}
            </a>
            {user?.id === category.userId && (
              <a
                className="ml-3 text-yellow-300"
                href={`/neverhaveiever/edit/${category.id}`}
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
