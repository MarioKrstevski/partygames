import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/db";
import { redirect } from "next/navigation";
import { shuffleArray } from "@/lib/utils";
import NeverHaveIEverGameComponent from "./NeverHaveIEverGameComponent";

export default async function PlayMostLikelyTo({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await validateRequest();

  const neverHaveIEverCategory =
    await prismadb.neverHaveIEverCategory.findFirst({
      where: { id: params.id },
    });

  if (!neverHaveIEverCategory) {
    redirect("/mostlikelyto");
  }
  if (
    !neverHaveIEverCategory.isPublic &&
    neverHaveIEverCategory.userId !== user?.id
  ) {
    return <div>You can&apos;t play that category</div>;
  }
  const withShuffledContent = {
    ...neverHaveIEverCategory,
    content: shuffleArray(neverHaveIEverCategory.content),
  };
  return (
    <main className="h-[calc(100vh_-_40px)]">
      <NeverHaveIEverGameComponent
        neverHaveIEverCategory={withShuffledContent}
      />
    </main>
  );
}
