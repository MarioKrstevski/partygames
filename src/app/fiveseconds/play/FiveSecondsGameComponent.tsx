"use client";
import { shuffleArray } from "@/lib/utils";
import { FiveSecondsCategory } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

export default function FiveSecondsGameComponent({
  fiveSecondsCategory,
}: {
  fiveSecondsCategory: FiveSecondsCategory;
}) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const timeLeftInterval = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(8);

  const [content, setContent] = useState<string[]>(
    fiveSecondsCategory.content
  );
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  function handleNextQuestion() {
    setTimeLeft(8);
    if (currentContentIndex === content.length - 1) {
      setContent(shuffleArray(fiveSecondsCategory.content));
      return;
    }
    setCurrentContentIndex((prev) => {
      if (prev + 1 === content.length) {
        return 0;
      }
      return prev + 1;
    });
  }

  //start game handler
  useEffect(() => {
    console.log("sth");
    timeLeftInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 0) {
          if (timeLeftInterval.current) {
            clearInterval(timeLeftInterval.current);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeLeftInterval.current) {
        clearInterval(timeLeftInterval.current);
      }
    };
  }, [currentContentIndex]);
  //effect description

  return (
    <div
      ref={gameContainerRef}
      className="grid grid-rows-[1fr_280px] items-center h-full"
    >
      <div className="text-center">
        <h1 className="flex justify-center">
          {timeLeft > 6 && "Get Ready"}
          {timeLeft === 6 && "Start"}
          {timeLeft < 6 && (
            <div className=" text-xl w-10 h-10 flex items-center justify-center rounded-full border-solid border-white border-1 p-1">
              {timeLeft}
            </div>
          )}
        </h1>
        <p className="text-2xl text-white mt-16">
          {timeLeft > 0
            ? content[currentContentIndex]
            : "Time’s up! 🙉"}
        </p>
      </div>
      <div className="text-center">
        <button onClick={handleNextQuestion}>Next</button>
      </div>
    </div>
  );
}
