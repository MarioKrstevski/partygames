"use client";

import { useState } from "react";

export default function WordsList({
  defaultItems,
}: {
  defaultItems?: string[];
}) {
  const [word, setWord] = useState("");
  const [words, setWords] = useState<string[]>(defaultItems || []);
  return (
    <div>
      <label htmlFor="word">Words</label>
      <input
        type="text"
        id="word"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="ex: cat,dog,elephant"
        aria-label="List description"
      />
      <button
        type="button"
        onClick={() => {
          const newWords = [];
          for (let w of word.split(",")) {
            if (w.trim() === "") {
              continue;
            }
            if (words.includes(w.trim())) {
              continue;
            }
            newWords.push(w.trim());
          }
          setWords([...words, ...newWords]);
          setWord("");
        }}
      >
        Add
      </button>
      <ul>
        {words.map((word) => (
          <li key={word}>
            {word}{" "}
            <span
              className="cursor-pointer text-red-400"
              onClick={() => {
                setWords(words.filter((w) => w !== word));
              }}
            >
              X
            </span>{" "}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={words.join(",")}
        onChange={() => {}}
        name="words"
        className="hidden"
      />
    </div>
  );
}
