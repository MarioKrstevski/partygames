"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { DeckActionState } from "@/app/actions/decks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "mk", label: "Македонски" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
] as const;

interface DeckFormSection {
  key: string;
  label: string;
  hint: string;
  placeholder: string;
  minItems: number;
}

export interface DeckFormProps {
  game: {
    slug: string;
    title: string;
    sections: DeckFormSection[];
  };
  action: (
    prevState: DeckActionState,
    formData: FormData,
  ) => Promise<DeckActionState>;
  initial?: {
    name: string;
    description: string;
    language: string;
    isPublic: boolean;
    content: Record<string, string[]>;
  };
  isAdmin?: boolean;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create deck"}
    </Button>
  );
}

export default function DeckForm({ game, action, initial, isAdmin }: DeckFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [language, setLanguage] = useState(initial?.language ?? "en");
  const knownLanguage = LANGUAGES.some((l) => l.value === initial?.language);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
        >
          {state.error}
        </div>
      )}

      <Card className="space-y-4 p-5">
        <div>
          <Label htmlFor="deck-name">Deck name</Label>
          <Input
            id="deck-name"
            name="name"
            required
            minLength={2}
            maxLength={60}
            defaultValue={initial?.name}
            placeholder={`My ${game.title} deck`}
          />
        </div>

        <div>
          <Label htmlFor="deck-description">Description</Label>
          <Input
            id="deck-description"
            name="description"
            maxLength={300}
            defaultValue={initial?.description}
            placeholder="What's this deck about? (optional)"
          />
        </div>

        <div>
          <Label htmlFor="deck-language">Language</Label>
          {/* Select is not a form control, so the value is submitted by the
              hidden input below and the server action is unchanged. */}
          <input type="hidden" name="language" value={language} />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="deck-language" className="w-full">
              <SelectValue placeholder="Pick a language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
              {initial?.language && !knownLanguage && (
                <SelectItem value={initial.language}>
                  {initial.language}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <div className="flex items-start gap-3">
            <input
              id="deck-public"
              name="isPublic"
              type="checkbox"
              defaultChecked={initial?.isPublic ?? true}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-violet-600"
            />
            <div>
              <Label htmlFor="deck-public" className="mb-0">
                Make this deck public
              </Label>
              <p className="text-xs text-zinc-400">
                Public decks are visible to everyone. Private decks are just for
                you.
              </p>
            </div>
          </div>
        )}
      </Card>

      {game.sections.map((section) => (
        <Card key={section.key} className="p-5">
          <Label htmlFor={`content-${section.key}`}>{section.label}</Label>
          <Textarea
            id={`content-${section.key}`}
            name={`content.${section.key}`}
            rows={8}
            required
            defaultValue={initial?.content[section.key]?.join("\n")}
            placeholder={section.placeholder}
            aria-describedby={`content-${section.key}-hint`}
          />
          <p
            id={`content-${section.key}-hint`}
            className="mt-1.5 text-xs text-zinc-400"
          >
            {section.hint} At least {section.minItems} entries, one per line.
          </p>
        </Card>
      ))}

      <SubmitButton isEdit={Boolean(initial)} />
    </form>
  );
}
