import Link from "next/link";

export default function Header() {
  return (
    <div className="overflow-hidden h-[80px] flex items-center justify-between px-5 py-2 shadow-lg shadow-gray-800  ">
      <div className="p-2">
        <Link href={"/"}>Logo: Party Games</Link>
      </div>
      <nav>
        <ul className="flex gap-1">
          <li>
            <Link href={"/signin"}>
              <button>Sign in</button>
            </Link>
          </li>
          <li>
            <Link href={"/signup"}>
              <button>Sign up</button>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
