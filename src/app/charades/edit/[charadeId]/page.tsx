import { Form } from "@/components/Form";
import WordsList from "../../new/_components/WordsList";
import { editCharade } from "@/app/actions/charades";
import prismadb from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import DeleteCharadeButton from "./DeleteCharadeButton";

export default async function EditCharadePage({
  params,
}: {
  params: { charadeId: string };
}) {
  const { user } = await validateRequest();
  if (!user) {
    return <div>Not authorized</div>;
  }
  const charade = await prismadb.charadeList.findFirst({
    where: { id: params.charadeId },
  });

  if (!charade) {
    return <div>Charade not found</div>;
  }

  return (
    <main className="container px-2 py-5 flex justify-center">
      <div className=" max-w-96 relative">
        <DeleteCharadeButton charadeId={charade.id} />
        <Form action={editCharade}>
          <input
            type="text"
            className="hidden"
            name="charadeId"
            defaultValue={charade.id}
          />
          <label htmlFor="name">Name</label>
          <input
            type="text"
            defaultValue={charade.name}
            name="name"
            placeholder="List name"
            aria-label="List name"
            required
          />
          <label htmlFor="description">Description</label>
          <input
            defaultValue={charade.description}
            type="text"
            name="description"
            placeholder="List description"
            aria-label="List description"
            required
          />

          <WordsList defaultItems={charade.content} />
          <button type="submit">Create</button>
        </Form>
      </div>
    </main>
  );
}
