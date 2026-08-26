"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareDeckDialogProps {
  deckName: string;
  shareUrl: string;
  /** Pre-rendered on the server so no QR library ships to the browser. */
  qrSvg: string;
}

export default function ShareDeckDialog({
  deckName,
  shareUrl,
  qrSvg,
}: ShareDeckDialogProps) {
  const [open, setOpen] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      // Clipboard access can be refused; the input is selectable as a fallback.
      toast.error("Could not copy — select the link and copy it manually");
    }
  }

  async function share() {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({
        title: deckName,
        text: `Play my "${deckName}" deck on Party Games`,
        url: shareUrl,
      });
    } catch {
      // Dismissing the share sheet is not an error worth reporting.
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          📤 Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share “{deckName}”</DialogTitle>
          <DialogDescription>
            Anyone with this link can play the deck and save their own copy —
            even without an account. It works whether or not the deck is public.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="mx-auto w-48 rounded-2xl bg-white p-3 [&_svg]:h-full [&_svg]:w-full"
            aria-label="QR code for this deck"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="text-center text-xs text-zinc-400">
            Hold this up — everyone scans it at once.
          </p>

          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button type="button" onClick={copyLink}>
              Copy
            </Button>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={share}
          >
            Share…
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
