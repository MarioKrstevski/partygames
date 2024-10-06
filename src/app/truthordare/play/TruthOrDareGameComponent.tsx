"use client";
import { TruthOrDareCategory } from "@prisma/client";
import { shuffleArray } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function TruthOrDareGameComponent({
  truthOrDareCategory,
}: {
  truthOrDareCategory: TruthOrDareCategory;
}) {
  const [choice, setChoice] = useState("");

  const [truthContent, setTruthContent] = useState<string[]>(
    truthOrDareCategory.truthContent
  );
  const [currentTruthContentIndex, setCurrentTruthContentIndex] =
    useState(-1);

  const [dareContent, setDareContent] = useState<string[]>(
    truthOrDareCategory.dareContent
  );
  const [currentDareContentIndex, setCurrentDareContentIndex] =
    useState(-1);

  function handleNextDare() {
    setChoice("dare");
    setCurrentDareContentIndex((prev) => {
      if (prev === dareContent.length - 1) {
        setDareContent(shuffleArray(dareContent));
        return 0;
      }
      return prev + 1;
    });
  }
  function handleNextTruth() {
    setChoice("truth");
    setCurrentTruthContentIndex((prev) => {
      if (prev === truthContent.length - 1) {
        setTruthContent(shuffleArray(truthContent));
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
          {!choice && "Pick a choice"}
          {choice === "truth" &&
            truthContent[currentTruthContentIndex]}
          {choice === "dare" && dareContent[currentDareContentIndex]}
        </p>
      </div>
      <div className="text-center flex gap-2 justify-center">
        <button onClick={handleNextTruth}>Truth</button>
        <button onClick={handleNextDare}>Dare</button>
      </div>
    </div>
  );
}
