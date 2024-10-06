"use client";
import {
  exitFullscreen,
  getOrientation,
  isMobile,
  requestFullscreen,
  shuffleArray,
  vibrate,
} from "@/lib/utils";
import { CharadeList } from "@prisma/client";
import { AnyAaaaRecord } from "dns";
import Link from "next/link";
import { useState, useEffect, useRef, useReducer } from "react";

type GameStateOptions =
  | "readyToStart"
  | "starting"
  | "playing"
  | "ended";

interface Answer {
  word: string;
  isCorrect: boolean;
}
interface GameState {
  status: GameStateOptions;
  gameStartingCountdown: number;
  timeRemainingCountdown: number;
  answers: Answer[];
}
type GameActionsTypes =
  | "start"
  | "startCountdown"
  | "count"
  | "end"
  | "tickStarting"
  | "tickPlaying";

interface GameActionPayload {
  word: string;
  isCorrect: boolean;
}
type GameAction =
  | { type: "start" }
  | { type: "startCountdown" }
  | { type: "tickStarting" }
  | { type: "tickPlaying" }
  | { type: "count"; payload?: GameActionPayload }
  | { type: "end" };

interface GameActions {
  type: GameActionsTypes;
  payload?: GameActionPayload;
}

const initialGameState: GameState = {
  status: "readyToStart",
  gameStartingCountdown: 5,
  timeRemainingCountdown: 70,
  answers: [],
};

function gameStateReducer(
  state: typeof initialGameState,
  action: GameActions
): GameState {
  switch (action.type) {
    case "startCountdown":
      return { ...state, status: "starting" };
    case "start":
      return { ...state, status: "playing" };
    case "tickStarting":
      return {
        ...state,
        gameStartingCountdown: state.gameStartingCountdown - 1,
      };
    case "tickPlaying":
      return {
        ...state,
        timeRemainingCountdown: state.timeRemainingCountdown - 1,
      };
    case "count":
      return {
        ...state,
        answers: [
          ...state.answers,
          {
            isCorrect: action.payload!.isCorrect,
            word: action.payload!.word,
          },
        ],
      };
    case "end":
      return {
        ...state,
        status: "ended",
        timeRemainingCountdown: 70,
      };
    default:
      return state;
  }
}

function CharadesGameComponent({
  charade,
}: {
  charade: CharadeList;
}) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const answerShowDivRef = useRef<HTMLDivElement>(null);

  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const gameEndSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);

  const timerRef = useRef<any>(null);
  const [words, setWords] = useState(
    shuffleArray(charade.content.split(","))
  );

  const [deviceOrientation, setDeviceOrientation] =
    useState("portrait");

  const [tilt, setTilt] = useState("Tilt: ");

  // @ts-ignore
  const [game, dispatch] = useReducer<
    React.Reducer<GameState, GameAction>
  >(gameStateReducer, initialGameState);

  //Load orientation on start
  useEffect(() => {
    setDeviceOrientation(getOrientation());
  }, []);
  //setup intervals
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  //starting the game
  useEffect(() => {
    if (game.status === "starting") {
      const timer = setInterval(() => {
        dispatch({ type: "tickStarting" });
      }, 1000);
      timerRef.current = timer;
    }

    if (game.status === "playing") {
      clearInterval(timerRef.current);
      const element = document.getElementById("gameContainer");
      if (element) {
        element.classList.add(
          "inset-0",
          "fixed",
          "z-[100]",
          "bg-black"
          // "relative"
        );
        // document.getElementById("fullscreenButton")?.click();
        requestFullscreen();
      }
      const timer = setInterval(() => {
        dispatch({ type: "tickPlaying" });
      }, 1000);
      timerRef.current = timer;

      // force mobile device in landscape mode
      if (isMobile()) {
        // @ts-ignore
        if (screen.orientation.lock) {
          // @ts-ignore
          screen.orientation.lock("landscape");
        }
      }
    }

    if (game.status === "ended") {
      // force mobile device in portrait mode
      const element = document.getElementById("gameContainer");
      if (element) {
        element.classList.remove(
          "inset-0",
          "fixed",
          "z-[100]",
          "bg-black"
          // "relative"
        );
        exitFullscreen();
      }

      clearInterval(timerRef.current);

      if (gameEndSoundRef.current) {
        gameEndSoundRef.current.pause();
        gameEndSoundRef.current.currentTime = 0;
        gameEndSoundRef.current.play();
      }

      if (isMobile()) {
        // @ts-ignore
        if (screen.orientation.lock) {
          // @ts-ignore
          screen.orientation.lock("portrait");
        }
      }
    }
  }, [game.status]);

  //timerControl
  useEffect(() => {
    if (game.gameStartingCountdown === 0) {
      dispatch({ type: "start" });
    }
  }, [game.gameStartingCountdown]);
  useEffect(() => {
    if (game.timeRemainingCountdown === 0) {
      dispatch({ type: "end" });
    }
  }, [game.timeRemainingCountdown]);

  function markAnswer(isCorrect: boolean) {
    answerShowDivRef.current?.classList.add("bg-black");

    if (isCorrect) {
      vibrate(220);
      if (correctSoundRef.current) {
        correctSoundRef.current.pause();
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play();
      }
      answerShowDivRef.current?.classList.add("bg-green-200/30");
      answerShowDivRef.current?.classList.remove("bg-black");
    } else {
      if (incorrectSoundRef.current) {
        incorrectSoundRef.current.pause();
        incorrectSoundRef.current.currentTime = 0;
        incorrectSoundRef.current.play();
      }
      vibrate([150, 150]);
      answerShowDivRef.current?.classList.remove("bg-black");
      answerShowDivRef.current?.classList.add("bg-red-300/30");
    }
    setTimeout(() => {
      answerShowDivRef.current?.classList.remove("bg-green-200/30");
      answerShowDivRef.current?.classList.remove("bg-red-300/30");
      answerShowDivRef.current?.classList.add("bg-black");
    }, 700);
  }

  //end of words
  useEffect(() => {
    if (game.answers.length === words.length) {
      dispatch({ type: "end" });
    }
    if (game.answers.length > 0) {
      markAnswer(game.answers[game.answers.length - 1].isCorrect);
    }
  }, [game.answers, words.length]);

  //add device orientation listener
  const updateOrientation = (event: any) => {
    console.log(event);
    setDeviceOrientation(getOrientation());
  };

  return (
    <div ref={gameContainerRef} id="gameContainer" className="">
      <button
        id="fullscreenButton"
        className="invisible h-0 w-0 absolute"
        onClick={() => {
          requestFullscreen();
        }}
      >
        fullscreen
      </button>
      <audio
        src="/assets/charades/correct-guess.mp3"
        ref={correctSoundRef}
      ></audio>
      <audio
        src="/assets/charades/wronganswer.mp3"
        ref={incorrectSoundRef}
      ></audio>
      <audio
        src="/assets/charades/success-game-ended.mp3"
        ref={gameEndSoundRef}
      ></audio>
      {/* <div>{game.status}</div>
      <div>{tilt}</div>
      <div>{deviceOrientation.split("-")[0]}</div> */}
      {/* <pre>{JSON.stringify(game.answers, null, 2)}</pre> */}
      {deviceOrientation.split("-")[0] === "landscape" &&
        game.status !== "playing" &&
        game.gameStartingCountdown > 0 && (
          <h3
            className="text-center"
            style={{
              color:
                game.gameStartingCountdown > 0 &&
                game.status === "starting"
                  ? "yellow"
                  : "unset",
            }}
          >
            {game.gameStartingCountdown}
          </h3>
        )}
      {/* Game is Ready to Start and Starting*/}
      {(game.status === "readyToStart" ||
        game.status === "starting") &&
        deviceOrientation.split("-")[0] === "landscape" && (
          <div className="flex flex-col items-center">
            <h1 className="text-4xl text-center">{charade.name}</h1>
            <p className="text-center">{charade.description}</p>
            <div className="flex flex-col items-center">
              {game.status === "readyToStart" && (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    dispatch({ type: "startCountdown" });
                  }}
                >
                  Start
                </button>
              )}
              <div className="mt-4"></div>
            </div>
          </div>
        )}
      {game.status === "readyToStart" &&
        deviceOrientation.split("-")[0] === "portrait" && (
          <div>Switch your phone to landscape</div>
        )}
      {/* Game is Playing */}
      {game.status === "playing" &&
        deviceOrientation.split("-")[0] === "landscape" && (
          <div className="grid grid-cols-[33%_1fr_33%] h-full">
            <button
              className=""
              onClick={() => {
                dispatch({
                  type: "count",
                  payload: {
                    isCorrect: true,
                    word: words[game.answers.length],
                  },
                });
              }}
            >
              Yes
            </button>
            <div
              ref={answerShowDivRef}
              className="flex items-center flex-col relative"
            >
              <h1 className="text-center absolute top-2">
                {game.timeRemainingCountdown}
              </h1>
              <h1 className="text-4xl text-center h-full flex items-center">
                {words[game.answers.length]}
              </h1>
              <button
                className="absolute bottom-0 p-0"
                onClick={() => {
                  dispatch({ type: "end" });
                }}
              >
                End
              </button>
            </div>
            {/* controls */}
            <button
              className=""
              onClick={() => {
                dispatch({
                  type: "count",
                  payload: {
                    isCorrect: false,
                    word: words[game.answers.length],
                  },
                });
              }}
            >
              No
            </button>
          </div>
        )}

      {/* Game Ended */}
      {game.status === "ended" && (
        <div>
          <h1 className="text-4xl text-center">Game Ended</h1>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl text-center">
              Results{" "}
              {
                game.answers.filter((answer) => answer.isCorrect)
                  .length
              }
              /{game.answers.length}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  location.reload();
                }}
              >
                Play again
              </button>
              <Link href={"/charades"}>
                <button>Back to categories</button>
              </Link>
            </div>
            <div className="mt-4 overflow-y-auto">
              {game.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`${
                    answer.isCorrect
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {answer.word}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharadesGameComponent;
