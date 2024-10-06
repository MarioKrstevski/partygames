import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/db";
import { redirect } from "next/navigation";
import { shuffleArray } from "@/lib/utils";
import TruthOrDareGameComponent from "../TruthOrDareGameComponent";

export default async function PlayTruthOrDare({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await validateRequest();

  const truthOrDareCategory =
    await prismadb.truthOrDareCategory.findFirst({
      where: { id: params.id },
    });

  if (!truthOrDareCategory) {
    redirect("/truthordare");
  }
  if (
    !truthOrDareCategory.isPublic &&
    truthOrDareCategory.userId !== user?.id
  ) {
    return <div>You can&apos;t play that category</div>;
  }
  const withShuffledContent = {
    ...truthOrDareCategory,
    truthContent: shuffleArray(truthOrDareCategory.truthContent),
    dareContent: shuffleArray(truthOrDareCategory.dareContent),
  };
  return (
    <main className="h-[calc(100vh_-_40px)]">
      <TruthOrDareGameComponent
        truthOrDareCategory={withShuffledContent}
      />
    </main>
  );
}
