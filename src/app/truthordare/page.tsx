import prismadb from "@/lib/db";
import { TruthOrDareCategory } from "@prisma/client";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";

export default async function TruthOrDarePage() {
  const todCategories = await prismadb.truthOrDareCategory.findMany({
    where: { isPublic: true },
  });
  const { user } = await validateRequest();
  return (
    <main className="container p-2">
      <h1>Truth or Dare</h1>
      <p>
        Play truth or dare with your friends
        <br />
        You can create your own challenges or questions to play with.
      </p>
      {user && (
        <Link href={"/truthordare/new"}>
          <button>Create your own</button>
        </Link>
      )}
      <h2>Pick a category</h2>
      {todCategories.length === 0 && <p>Nothing found</p>}
      <ul>
        {todCategories.map((category: TruthOrDareCategory) => (
          <li key={category.id}>
            <a href={`/truthordare/play/${category.id}`}>
              {category.name}
            </a>
            {user?.id === category.userId && (
              <a
                className="ml-3 text-yellow-300"
                href={`/truthordare/edit/${category.id}`}
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
