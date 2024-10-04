"use client";
import { isMobile, shuffleArray } from "@/lib/utils";
import { CharadeList } from "@prisma/client";
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
  gameStartingCountdown: 2,
  timeRemainingCountdown: 22,
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
      return { ...state, status: "ended", timeRemainingCountdown: 0 };
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
  const timerRef = useRef<any>(null);
  const [words, setWords] = useState(
    shuffleArray(charade.items.split(","))
  );

  const [deviceOrientation, setDeviceOrientation] =
    useState("portrait");

  // @ts-ignore
  const [game, dispatch] = useReducer<
    React.Reducer<GameState, GameAction>
  >(gameStateReducer, initialGameState);

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
      clearInterval(timerRef.current);
    }
  }, [game.gameStartingCountdown]);
  useEffect(() => {
    if (game.timeRemainingCountdown === 0) {
      dispatch({ type: "end" });
      clearInterval(timerRef.current);
    }
  }, [game.timeRemainingCountdown]);

  function markAnswer(isCorrect: boolean) {
    if (isCorrect) {
      gameContainerRef.current?.classList.add("bg-green-200/30");
    } else {
      gameContainerRef.current?.classList.add("bg-red-300/30");
    }
    setTimeout(() => {
      gameContainerRef.current?.classList.remove("bg-green-200/30");
      gameContainerRef.current?.classList.remove("bg-red-300/30");
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

  const getOrientation = () => window.screen.orientation.type;
  //add device orientation listener
  const updateOrientation = (event: any) => {
    console.log(event);
    setDeviceOrientation(getOrientation());
  };

  useEffect(() => {
    window.addEventListener("orientationchange", updateOrientation);
    window.addEventListener("deviceorientation", handleTilt);

    return () => {
      window.removeEventListener(
        "orientationchange",
        updateOrientation
      );
      window.removeEventListener("deviceorientation", handleTilt);
    };
  }, []);

  const handleTilt = (event: DeviceOrientationEvent) => {
    const { x, y } = (
      event as DeviceOrientationEvent & {
        accelerationIncludingGravity: { x: number; y: number };
      }
    ).accelerationIncludingGravity;
    if (!x || !y) return;
    if (x > 0.5) {
      // Tilting right (yes)
      dispatch({
        type: "count",
        payload: {
          isCorrect: true,
          word: words[game.answers.length],
        },
      });
    } else if (x < -0.5) {
      // Tilting left (no)
      dispatch({
        type: "count",
        payload: {
          isCorrect: false,
          word: words[game.answers.length],
        },
      });
    }
  };

  return (
    <div ref={gameContainerRef} className="">
      <div>{game.status}</div>
      <div>{deviceOrientation.split("-")[0]}</div>
      {/* <pre>{JSON.stringify(game.answers, null, 2)}</pre> */}
      {deviceOrientation.split("-")[0] === "landscape" && (
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
          {game.gameStartingCountdown ||
            game.timeRemainingCountdown ||
            "Time's Up"}
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
          <div>
            <h1 className="text-4xl text-center">
              {words[game.answers.length]}
            </h1>
            {/* controls */}
            <div>
              <button
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
              <button
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
            <div>{deviceOrientation}</div>
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
              <button>Play again</button>
              <button>Back to categories</button>
            </div>
            <div className="mt-4">
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
