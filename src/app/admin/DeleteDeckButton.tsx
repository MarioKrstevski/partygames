"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { adminDeleteDeck } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteDeckButtonProps {
  deckId: string;
  gameSlug: string;
  deckName: string;
}

export default function DeleteDeckButton({
  deckId,
  gameSlug,
  deckName,
}: DeleteDeckButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await adminDeleteDeck(deckId, gameSlug);
      toast.success(`Deleted “${deckName}”`);
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="xs" disabled={pending}>
          {pending ? "…" : "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{deckName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the deck for everyone. It cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Delete deck
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
