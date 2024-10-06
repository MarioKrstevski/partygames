import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/db";
import { redirect } from "next/navigation";
import { shuffleArray } from "@/lib/utils";
import MostLikelyToGameComponent from "./MostLikelyToGameComponent";

export default async function PlayMostLikelyTo({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await validateRequest();

  const mostLikelyToCategory =
    await prismadb.mostLikelyToCategory.findFirst({
      where: { id: params.id },
    });

  if (!mostLikelyToCategory) {
    redirect("/mostlikelyto");
  }
  if (
    !mostLikelyToCategory.isPublic &&
    mostLikelyToCategory.userId !== user?.id
  ) {
    return <div>You can&apos;t play that category</div>;
  }
  const withShuffledContent = {
    ...mostLikelyToCategory,
    content: shuffleArray(mostLikelyToCategory.content),
  };
  return (
    <main className="h-[calc(100vh_-_40px)]">
      <MostLikelyToGameComponent
        mostLikelyToCategory={withShuffledContent}
      />
    </main>
  );
}
