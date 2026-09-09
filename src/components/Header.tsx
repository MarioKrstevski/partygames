import Link from "next/link";
import { getUser, isAdminEmail } from "@/lib/auth";
import { ButtonLink } from "@/components/button-link";
import AccountMenu from "@/components/AccountMenu";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-white transition-colors hover:text-violet-300"
        >
          <span aria-hidden="true" className="inline-block size-2.5 rounded-[3px] bg-primary align-[-1px] shadow-[0_0_0_3px_oklch(0.55_0.24_295/35%)]" />
          <span className="ml-2">Party Games</span>
        </Link>

        <nav aria-label="Account" className="flex items-center gap-2">
          {user ? (
            <AccountMenu
              name={user.name || user.email}
              isAdmin={isAdminEmail(user.email)}
            />
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
