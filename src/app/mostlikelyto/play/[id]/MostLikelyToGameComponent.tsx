"use client";
import { MostLikelyToCategory } from "@prisma/client";
import { shuffleArray } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function MostLikelyToGameComponent({
  mostLikelyToCategory,
}: {
  mostLikelyToCategory: MostLikelyToCategory;
}) {
  const [content, setDareContent] = useState<string[]>(
    mostLikelyToCategory.content
  );
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  function handleNextStatement() {
    setCurrentContentIndex((prev) => {
      if (prev === content.length - 1) {
        setDareContent(shuffleArray(content));
        return 0;
      }
      return prev + 1;
    });
  }

  //start game handler
  useEffect(() => {}, []);

  return (
    <div className="grid grid-rows-[1fr_280px] items-center h-full">
      <div className="text-center">
        <p className="text-2xl  mt-16 px-4">
          {content[currentContentIndex]}
        </p>
      </div>
      <div className="text-center flex gap-2 justify-center">
        <button onClick={handleNextStatement}>Next</button>
      </div>
    </div>
  );
}
