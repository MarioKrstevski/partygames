"use client";
import { logout } from "@/app/actions/auth";
import { isLoggedInClient } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  //effect description
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const isAuthenticated = isLoggedInClient();
    if (isAuthenticated) {
      setIsLoggedIn(true);
    }
  }, []);
  return (
    <div className="overflow-hidden h-[40px] flex items-center justify-between px-5 py-2 shadow-lg shadow-gray-800  ">
      <div className="p-2">
        <Link href={"/"}>Logo: Party Games</Link>
      </div>
      <nav>
        {!isLoggedIn ? (
          <ul className="flex gap-1">
            <li>
              <Link href={"/signin"}>
                <button className="py-0.5 px-1 text-sm">
                  Sign in
                </button>
              </Link>
            </li>
            <li>
              <Link href={"/signup"}>
                <button className="py-0.5 px-1 text-sm">
                  Sign up
                </button>
              </Link>
            </li>
          </ul>
        ) : (
          <form
            action={logout}
            onSubmit={() => {
              setIsLoggedIn(false);
            }}
          >
            <button className="py-0.5 px-1 text-sm">Logout</button>
          </form>
        )}
      </nav>
    </div>
  );
}
