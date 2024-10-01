import { addCharade } from "@/app/actions/charades";
import WordsList from "./_components/WordsList";
import { Form } from "@/components/Form";

export default function NewCharadesPage() {
  return (
    <main className="container px-2 py-5 flex justify-center">
      <div className=" max-w-96">
        <Form action={addCharade}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            placeholder="List name"
            aria-label="List name"
            required
          />
          <label htmlFor="description">Description</label>
          <input
            type="text"
            name="description"
            placeholder="List description"
            aria-label="List description"
            required
          />

          <WordsList />
          <button type="submit">Create</button>
        </Form>
      </div>
    </main>
  );
}
