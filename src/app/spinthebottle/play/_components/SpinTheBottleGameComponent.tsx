"use client";

import { randomNumber } from "@/lib/utils";
import { useRef } from "react";

export default function SpinTheBottleGameComponent() {
  const clickCounterRef = useRef(0);
  function startAnimation(e: any) {
    // e.target.classList.add("duration-400");
    // e.target.classList.remove("duration-1000");
    clickCounterRef.current += 1;
    //   e.target.classList.remove("duration-400");
    //   e.target.classList.add("duration-1000");
    const times = randomNumber(3, 7);
    console.log(times);
    let spinAngle = randomNumber(0, 360) * times + 360;
    console.log(spinAngle);

    if (clickCounterRef.current % 2 === 0) {
      spinAngle *= -1;
    }

    e.target.style.transform = "rotate(" + spinAngle + "deg)";
  }
  return (
    <div className="h-full flex items-center justify-center">
      <img
        onClick={startAnimation}
        className="transition-all duration-[2500ms]  ease-in-out"
        src="/assets/spinthebottle/bottle.png"
        width={318}
        height={318}
        alt="Bottle"
      />
    </div>
  );
}
