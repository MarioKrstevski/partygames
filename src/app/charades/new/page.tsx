export default function NewCharadesPage() {
  return (
    <main className="container px-2 py-5 flex justify-center">
      <form className=" max-w-96">
        <input
          type="text"
          name="firstname"
          placeholder="First name"
          aria-label="First name"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          aria-label="Email address"
          autoComplete="email"
          required
        />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
