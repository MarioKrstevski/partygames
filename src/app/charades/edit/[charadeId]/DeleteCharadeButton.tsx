"use client";
import { deleteCharade } from "@/app/actions/charades";

export default function DeleteCharadeButton({
  charadeId,
}: {
  charadeId: string;
}) {
  return (
    <button
      onClick={async () => {
        await deleteCharade(charadeId);
      }}
      className="py-0.5 absolute px-1 bg-red-300 text-black inline ml-auto text-xs right-0 "
    >
      Delete
    </button>
  );
}
