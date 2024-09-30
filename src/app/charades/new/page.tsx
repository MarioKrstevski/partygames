import WordsList from "./_components/WordsList";

export default function NewCharadesPage() {
  return (
    <main className="container px-2 py-5 flex justify-center">
      <form className=" max-w-96">
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
        />

        <WordsList />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
