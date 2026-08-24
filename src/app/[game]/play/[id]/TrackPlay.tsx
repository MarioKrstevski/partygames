"use client";

import { useEffect } from "react";
import { trackPlay } from "@/app/actions/plays";

export default function TrackPlay({ deckId }: { deckId: string }) {
  useEffect(() => {
    trackPlay(deckId);
  }, [deckId]);

  return null;
}
