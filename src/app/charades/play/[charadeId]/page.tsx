import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/db";
import { redirect } from "next/navigation";
import CharadesGameComponent from "../CharadesGameComponent";

export default async function PlayCharadesGame({
  params,
}: {
  params: { charadeId: string };
}) {
  const { user } = await validateRequest();
  // if (!user) {
  //   return <div>Not authorized</div>;
  // }
  const charade = await prismadb.charadeList.findFirst({
    where: { id: params.charadeId },
  });

  if (!charade) {
    redirect("/charades");
    // return <div>Charade not found</div>;
  }
  if (!charade.isPublic && charade.userId !== user?.id) {
    return <div>You can&apos;t play that game</div>;
  }
  return (
    <main>
      <CharadesGameComponent charade={charade} />
    </main>
  );
}
