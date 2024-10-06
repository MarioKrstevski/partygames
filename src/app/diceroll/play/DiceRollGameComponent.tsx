"use client";
import { useRef, useState } from "react";
import Dice from "./Dice";
import "./diceroll.css";
export default function DiceRollGameComponent() {
  const [diceAmount, setDiceAmount] = useState(1);
  const diceContainerElement = useRef<HTMLDivElement>(null);
  function rollDice() {
    if (diceContainerElement.current === null) {
      return;
    }
    var diceContainer = diceContainerElement.current;
    diceContainer.querySelectorAll(".dice").forEach((dice) => {
      const randomNumber = Math.floor(Math.random() * 6 + 1);
      console.log(randomNumber);

      for (var i = 1; i <= 6; i++) {
        dice.classList.remove("show-" + i);
        if (randomNumber === i) {
          dice.classList.add("show-" + i);
        }
      }
    });
  }
  return (
    <div className="grid grid-rows-[200px_1fr_280px] items-center h-full">
      <div>
        <h1 className="text-center text-2xl mt-16 px-4">
          How many dice
        </h1>
        <div className="flex gap-1 items-center justify-center">
          <div
            className=" rounded text-lg border p-2 cursor-pointer bg-slate-500 text-white w-9 h-9 flex items-center justify-center"
            onClick={() => {
              setDiceAmount(1);
            }}
          >
            1
          </div>
          <div
            className=" rounded text-lg border p-2 cursor-pointer bg-slate-500 text-white w-9 h-9 flex items-center justify-center"
            onClick={() => {
              setDiceAmount(2);
            }}
          >
            2
          </div>
          <div
            className=" rounded text-lg border p-2 cursor-pointer bg-slate-500 text-white w-9 h-9 flex items-center justify-center"
            onClick={() => {
              setDiceAmount(3);
            }}
          >
            3
          </div>
        </div>
      </div>
      <div
        ref={diceContainerElement}
        className="text-center flex justify-center  gap-2"
      >
        {Array.from({ length: diceAmount }).map((_, index) => (
          <Dice key={index} />
        ))}
      </div>
      <div className="text-center flex gap-2 justify-center">
        <button onClick={rollDice}>Roll Dice</button>
      </div>
    </div>
  );
}
