"use client";
import { isLoggedInClient } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CreateListButton() {
  const [show, setShow] = useState(false);
  //effect description
  useEffect(() => {
    if (isLoggedInClient()) {
      setShow(true);
    }
  }, []);
  if (!show) {
    return null;
  }
  return (
    <Link href={"/charades/new"}>
      <button>Create a List</button>
    </Link>
  );
}
