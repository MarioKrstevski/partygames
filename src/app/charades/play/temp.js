// ignore ts on whole file

const endTimer = () => {
    clearInterval(timerRemainingIntervalRef.current);
  };
  //pregame countdown
  useEffect(() => {
    if (isGameStarted) {
      const countdown = setInterval(() => {
        setGameStartingCountdown(
          (prevCountdown) => prevCountdown - 1
        );
        if (gameStartingCountdown === 0) {
          clearInterval(countdown);
          if (isMobile()) {
            startTimer(); // Start the timer when the component mounts
          }
        }
      }, 1000);
    }
  }, [isGameStarted]);

  // set layout view on mobile
  useEffect(() => {
    if (isMobile()) {
      setIsLayoutView(true);
    }
  }, []);

  //Active game
  useEffect(() => {
    if (
      isGameStarted &&
      (timeRemaining === 0 || currentWordIndex === words.length)
    ) {
      endGame();
    }
  }, [timeRemaining, currentWordIndex]);

  const endGame = () => {
    endTimer();
    setIsGameStarted(false);
    setIsGameEnded(true);
    // Game ends, perform necessary actions (e.g., show final score)
    console.log("Game over!");
  };

  const handleTilt = (event: DeviceOrientationEvent) => {
    const { x, y } = (
      event as DeviceOrientationEvent & {
        accelerationIncludingGravity: { x: number; y: number };
      }
    ).accelerationIncludingGravity;
    if (!x || !y) return;
    if (x > 0.5) {
      // Tilting right (yes)
      checkAnswer(true);
    } else if (x < -0.5) {
      // Tilting left (no)
      checkAnswer(false);
    }
  };

  const checkAnswer = (isCorrect: boolean) => {
    setIsWordCorrect(isCorrect);

    setAnswers((ps) => [...ps, isCorrect]);
    // Advance to the next word if there are more words

    if (isCorrect) {
      bgGameRef.current.style.backgroundColor = "green";
    } else {
      bgGameRef.current.style.backgroundColor = "red";
    }

    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        bgGameRef.current.style.backgroundColor = "white";

        setCurrentWordIndex((prevIndex) => prevIndex + 1);
        setIsWordCorrect(false);
      }
    }, 500);
  };
  useEffect(() => {
    window.addEventListener("deviceorientation", handleTilt);

    return () => {
      window.removeEventListener("deviceorientation", handleTilt);
    };
  }, []);

  if (!isLayoutView) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p>This game is best played on a mobile device.</p>
      </div>
    );
  }
  if (!isGameStarted) {
    return (
      <div>
        <div className="text-center p-4">
          <button onClick={() => setIsGameStarted(true)}>
            Start Game
          </button>
        </div>
      </div>
    );
  }
  if (!isGameStarted && gameStartingCountdown > 0) {
    return (
      <div>
        <div className="text-center p-4">
          Game starting in {gameStartingCountdown} seconds
        </div>
      </div>
    );
  }
  const gameIsOngoing =
    !isGameStarted &&
    gameStartingCountdown === 0 &&
    timeRemaining > 0 &&
    timeRemaining < 60;

  if (gameIsOngoing) {
    return (
      <div ref={bgGameRef}>
        <div className="text-center p-4">
          <h2>{words[currentWordIndex]}</h2>
          <button
            onClick={() => {
              checkAnswer(true);
            }}
          >
            YES
          </button>
          <button
            onClick={() => {
              checkAnswer(false);
            }}
          >
            NO
          </button>
        </div>
      </div>
    );
  }

  return null;