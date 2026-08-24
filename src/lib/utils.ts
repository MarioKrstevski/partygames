import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
    navigator.userAgent
  );
}
export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function vibrate(length: number[] | number) {
  if (navigator.vibrate) {
    navigator.vibrate(length);
  }
}

/**
 * Fullscreen requests reject when the browser refuses them — no user gesture,
 * a permissions policy, or an embedded frame. Nothing here depends on the
 * request succeeding, so the rejection is swallowed rather than surfacing as
 * an uncaught promise error. The prefixed variants return undefined.
 */
function ignoreRejection(result: unknown) {
  if (result && typeof (result as Promise<void>).catch === "function") {
    (result as Promise<void>).catch(() => {});
  }
}

export function exitFullscreen() {
  if (!document) {
    console.log("No document");
    return;
  }
  if (!document.fullscreenElement) {
    return;
    // @ts-ignore
  } else if (document.exitFullscreen) {
    ignoreRejection(document.exitFullscreen());
    // @ts-ignore
  } else if (document.mozCancelFullScreen) {
    // @ts-ignore
    ignoreRejection(document.mozCancelFullScreen());
    // @ts-ignore
  } else if (document.webkitExitFullscreen) {
    // @ts-ignore
    ignoreRejection(document.webkitExitFullscreen());
    // @ts-ignore
  } else if (document.msExitFullscreen) {
    // @ts-ignore
    ignoreRejection(document.msExitFullscreen());
  }
}
export function requestFullscreen() {
  if (!document) {
    console.log("No document");
    return;
  }
  const element = document.documentElement;

  if (element.requestFullscreen) {
    ignoreRejection(element.requestFullscreen());
    // @ts-ignore
  } else if (element.mozRequestFullScreen) {
    // @ts-ignore
    ignoreRejection(element.mozRequestFullScreen());

    // @ts-ignore
  } else if (element.webkitRequestFullscreen) {
    // @ts-ignore
    ignoreRejection(element.webkitRequestFullscreen());

    // @ts-ignore
  } else if (element.msRequestFullscreen) {
    // @ts-ignore
    ignoreRejection(element.msRequestFullscreen());
  }
}
export function getOrientation() {
  return window.screen.orientation.type;
}

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
