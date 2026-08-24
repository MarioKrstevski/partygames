import { ButtonLink } from "@/components/button-link";
import { PageContainer } from "@/components/layout";

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span aria-hidden className="text-6xl">
        🎈💥
      </span>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
        404 — this party doesn&apos;t exist
      </h1>
      <p className="mt-2 max-w-md text-zinc-400">
        Either the page moved, the deck is private, or someone gave you a bad
        address. Happens to the best of us.
      </p>
      <div className="mt-6">
        <ButtonLink href="/">Take me to the games</ButtonLink>
      </div>
    </PageContainer>
  );
}
