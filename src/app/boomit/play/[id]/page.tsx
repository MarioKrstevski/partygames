import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/db";
import { redirect } from "next/navigation";
import { randomNumber, shuffleArray } from "@/lib/utils";
import BoomItGameComponent from "./BoomItGameComponent";

export default async function PlayMostLikelyTo({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await validateRequest();

  const boomItCategory = await prismadb.boomItCategory.findFirst({
    where: { id: params.id },
  });

  if (!boomItCategory) {
    redirect("/boomit");
  }
  if (
    !boomItCategory.isPublic &&
    boomItCategory.userId !== user?.id
  ) {
    return <div>You can&apos;t play that category</div>;
  }
  const withShuffledContent = {
    ...boomItCategory,
    statementsContent: shuffleArray(boomItCategory.statementsContent),
    punishmentsContent: shuffleArray(
      boomItCategory.punishmentsContent
    ),
  };
  return (
    <main className="h-[calc(100vh_-_40px)]">
      <BoomItGameComponent
        boomItCategory={withShuffledContent}
        length={randomNumber(40, 60)}
      />
    </main>
  );
}
