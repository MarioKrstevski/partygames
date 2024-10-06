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
export function shuffleArray(array: any) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return [...array];
}
export function isLoggedInClient() {
  if (typeof window === "undefined") {
    return;
  }
  const authCookieExists = checkCookie("auth-cookie-exists");
  return authCookieExists;
}

function checkCookie(cookieName: string) {
  const cookies = document.cookie.split(";"); // Split the cookie string by semicolons to get individual cookies

  for (let cookie of cookies) {
    // Trim leading/trailing spaces
    cookie = cookie.trim();

    // Check if the current cookie starts with the given name
    if (cookie.startsWith(`${cookieName}=`)) {
      return true; // Cookie exists
    }
  }
  return false; // Cookie does not exist
}

export function vibrate(length: number[] | number) {
  if (navigator.vibrate) {
    navigator.vibrate(length);
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
    document.exitFullscreen();
    // @ts-ignore
  } else if (document.mozCancelFullScreen) {
    // @ts-ignore
    document.mozCancelFullScreen();
    // @ts-ignore
  } else if (document.webkitExitFullscreen) {
    // @ts-ignore
    document.webkitExitFullscreen();
    // @ts-ignore
  } else if (document.msExitFullscreen) {
    // @ts-ignore
    document.msExitFullscreen();
  }
}
export function requestFullscreen() {
  if (!document) {
    console.log("No document");
    return;
  }
  const element = document.documentElement;

  if (element.requestFullscreen) {
    element.requestFullscreen();
    // @ts-ignore
  } else if (element.mozRequestFullScreen) {
    // @ts-ignore
    element.mozRequestFullScreen();

    // @ts-ignore
  } else if (element.webkitRequestFullscreen) {
    // @ts-ignore
    element.webkitRequestFullscreen();

    // @ts-ignore
  } else if (element.msRequestFullscreen) {
    // @ts-ignore
    element.msRequestFullscreen();
  }
}
export function getOrientation() {
  return window.screen.orientation.type;
}

export function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
