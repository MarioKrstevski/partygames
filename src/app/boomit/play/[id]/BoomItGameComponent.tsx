"use client";
import { BoomItCategory, MostLikelyToCategory } from "@prisma/client";
import { randomNumber, shuffleArray } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { random } from "oslo/crypto";

const bgColors: { [key: number]: string } = {
  3: "#257180",
  2: "#FD8B51",
  1: "#A5B68D",
};

const bgColorsOptions: string[] = ["#257180", "#FD8B51", "#A5B68D"];
export default function BoomItGameComponent({
  boomItCategory,
  length,
}: {
  boomItCategory: BoomItCategory;
  length: number;
}) {
  const [roundLength, setRoundLength] = useState<number>(length);
  const gameStartInterval = useRef<NodeJS.Timeout | null>(null);
  const tickInterval = useRef<NodeJS.Timeout | null>(null);
  const tickAudioEL = useRef<HTMLAudioElement>(null);
  const flashEl = useRef<HTMLDivElement>(null);
  const [bombTimer, setBombTimer] = useState(roundLength + 3);
  const [statements, setStatements] = useState<string[]>(
    boomItCategory.statementsContent
  );
  const [currentStatementIndex, setCurrentStatementIndex] =
    useState(0);
  const [nextRoundCounter, setNextRoundCounter] = useState(0);

  const [punishments, setPunishments] = useState<string[]>(
    boomItCategory.punishmentsContent
  );
  const [currentPunishmentIndex, setCurrentPunishmentIndex] =
    useState(-1);

  function handleNextStatement() {
    setCurrentStatementIndex((prev) => {
      if (prev === statements.length - 1) {
        setStatements(shuffleArray(statements));
        return 0;
      }
      return prev + 1;
    });
  }

  //start game handler
  useEffect(() => {
    gameStartInterval.current = setInterval(() => {
      setBombTimer((prev) => prev - 1);
    }, 1000);
    return () => {
      clearInterval(gameStartInterval.current as NodeJS.Timeout);
    };
  }, [nextRoundCounter]);
  //effect description
  //bomb ticking sound
  useEffect(() => {
    //sound
  }, []);
  function bombTick() {
    clearInterval(tickInterval.current as NodeJS.Timeout);
    const currentFlashEl = flashEl.current as HTMLDivElement;
    currentFlashEl.style.opacity = "0.2";
    let opacity = 0.2;
    tickAudioEL.current!.pause();
    tickAudioEL.current!.currentTime = 0;
    tickAudioEL.current!.play();
    tickInterval.current = setInterval(() => {
      if (opacity <= 0.07) {
        currentFlashEl.style.opacity = "0";

        clearInterval(tickInterval.current as NodeJS.Timeout);
        return;
      }
      opacity -= 0.005;
      currentFlashEl.style.opacity = opacity.toString();
    }, 25);
  }
  useEffect(() => {
    if (bombTimer === 0) {
      clearInterval(gameStartInterval.current as NodeJS.Timeout);
      // bomb exploded
      setCurrentPunishmentIndex((prev) => {
        if (prev === punishments.length - 1) {
          return 0;
        }
        return prev + 1;
      });
      //bomb sound
      // flash screen
    }
    if (bombTimer <= roundLength && bombTimer > 0) {
      setTimeout(() => {
        clearInterval(tickInterval.current as NodeJS.Timeout);
        bombTick();
      }, 300 + Math.random() * 1000);
    }
  }, [bombTimer]);

  function handleStartNewRound() {
    let newRoundLength = randomNumber(40, 60);
    setRoundLength(newRoundLength);
    setBombTimer(newRoundLength + 3);
    setCurrentStatementIndex(0);
    setCurrentPunishmentIndex(-1);
    setNextRoundCounter((prev) => prev + 1);
  }
  if (bombTimer === 0) {
    return (
      <div
        className="grid grid-rows-[150px_1fr_280px] items-center h-full text-white"
        style={{
          backgroundColor: bgColors[bombTimer],
        }}
      >
        <div></div>
        <div className="text-xl">
          <p className="text-center">
            You're toast! The bomb went off in your hands!
          </p>
          <div className="flex flex-col items-center">
            <div>Punishment:</div>
            <p>{punishments[currentPunishmentIndex]}</p>
          </div>
        </div>
        <div className="text-center ">
          <button onClick={handleStartNewRound}>
            Start New Round
          </button>
        </div>
      </div>
    );
  }

  if (bombTimer > roundLength) {
    return (
      <div
        className="  grid grid-rows-[150px_1fr_280px] items-center h-full text-white"
        style={{
          backgroundColor: bgColors[bombTimer - roundLength],
        }}
      >
        <div className="text-center row-start-2">
          <h1 className="text-5xl">{bombTimer - roundLength}</h1>
          <h2>Prepare yourselves</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative grid grid-rows-[150px_1fr_280px] items-center h-full"
      style={{
        backgroundColor:
          bgColorsOptions[
            currentStatementIndex % bgColorsOptions.length
          ],
      }}
    >
      <audio ref={tickAudioEL} src="/assets/boomit/tick.mp3"></audio>
      <div
        ref={flashEl}
        className="pointer-events-none absolute  opacity-0  inset-0 flashing-screen bg-white z-20"
      ></div>

      <div></div>
      <div className="text-center ">
        <p className="text-2xl  mt-16 px-4 text-white font-semibold">
          {statements[currentStatementIndex]}
        </p>
      </div>
      <div className="text-center flex gap-2 justify-center">
        <button onClick={handleNextStatement}>Continue</button>
      </div>
    </div>
  );
}
