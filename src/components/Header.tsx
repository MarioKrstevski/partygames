import Link from "next/link";
import { getUser } from "@/lib/auth";
import { ButtonLink } from "@/components/ui";
import SignOutButton from "@/components/SignOutButton";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0a1a]/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-white transition-colors hover:text-violet-300"
        >
          <span aria-hidden="true">🎉</span> Party Games
        </Link>

        <nav aria-label="Account" className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink href="/decks" variant="ghost" className="px-3 py-2">
                My decks
              </ButtonLink>
              <SignOutButton />
            </>
          ) : (
            <>
              <ButtonLink href="/signin" variant="ghost" className="px-3 py-2">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup" className="px-3 py-2">
                Sign up
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
