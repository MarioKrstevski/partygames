import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/db";
import { redirect } from "next/navigation";
import FiveSecondsGameComponent from "../FiveSecondsGameComponent";
import { shuffleArray } from "@/lib/utils";

export default async function PlayFiveSeconds({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await validateRequest();

  const fiveSecondsCategory =
    await prismadb.fiveSecondsCategory.findFirst({
      where: { id: params.id },
    });

  if (!fiveSecondsCategory) {
    redirect("/fiveseconds");
  }
  if (
    !fiveSecondsCategory.isPublic &&
    fiveSecondsCategory.userId !== user?.id
  ) {
    return <div>You can&apos;t play that category</div>;
  }
  const withShuffledContent = {
    ...fiveSecondsCategory,
    content: shuffleArray(fiveSecondsCategory.content),
  };
  return (
    <main className="h-[calc(100vh_-_40px)]">
      <FiveSecondsGameComponent
        fiveSecondsCategory={withShuffledContent}
      />
    </main>
  );
}
