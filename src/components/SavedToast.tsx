"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  created: "Deck created.",
  updated: "Deck saved.",
  deleted: "Deck deleted.",
};

/**
 * Deck actions redirect on success, so the confirmation is passed along as a
 * ?saved= param and shown here, then stripped from the URL.
 */
export default function SavedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const saved = searchParams.get("saved");

  useEffect(() => {
    if (!saved) return;
    const message = MESSAGES[saved];
    if (message) toast.success(message);
    router.replace(pathname, { scroll: false });
  }, [saved, router, pathname]);

  return null;
}
