"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { randomNumber } from "@/lib/utils";

const SPIN_DURATION_MS = 2500;

export default function SpinTheBottleGameComponent() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(spinTimeout.current), []);

  function spin() {
    if (isSpinning) return;
    setIsSpinning(true);
    const fullTurns = randomNumber(3, 6);
    setRotation((current) => current + fullTurns * 360 + randomNumber(0, 359));
    // Fallback in case transitionend never fires (interrupted/cancelled transition)
    spinTimeout.current = setTimeout(
      () => setIsSpinning(false),
      SPIN_DURATION_MS + 200,
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 py-10">
      <button
        type="button"
        onClick={spin}
        disabled={isSpinning}
        aria-label="Spin the bottle"
        className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
      >
        <Image
          src="/assets/spinthebottle/bottle.png"
          alt=""
          width={318}
          height={318}
          priority
          className="transition-transform ease-in-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${SPIN_DURATION_MS}ms`,
          }}
          onTransitionEnd={() => setIsSpinning(false)}
        />
      </button>
      <Button onClick={spin} disabled={isSpinning} className="w-40">
        {isSpinning ? "Spinning…" : "Spin"}
      </Button>
    </div>
  );
}
