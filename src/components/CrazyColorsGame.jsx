import { useState, useEffect, useCallback } from "react";
// Import for device detection
import { useLayoutEffect } from "react";

// Constants
const COLOR_NAMES = [
  "ЧЁРНЫЙ",
  "БЕЛЫЙ",
  "КРАСНЫЙ",
  "ОРАНЖЕВЫЙ",
  "ЖЁЛТЫЙ",
  "ЗЕЛЁНЫЙ",
  "ГОЛУБОЙ",
  "СИНИЙ",
  "ФИОЛЕТОВЫЙ",
];
const COLOR_CODES = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#FFA500",
  "#FFFF00",
  "#008000",
  "#42AAFF",
  "#0000FF",
  "#8B00FF",
];
const PRESSED_COLOR = "#623462";
const OPTIONS = ["Какого цвета буквы?", "Какого цвета фон?"];

// Game screens enum
const SCREENS = {
  INTRO: "intro",
  SELECTION: "selection",
  MAIN: "main",
};

// Device detection function
const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    isMobile: width <= 768,
    screenWidth: width,
    screenHeight: height,
  };
};

// Game dimensions configuration
const GAME_DIMENSIONS = {
  DESKTOP: {
    width: 600,
    height: 720,
  },
  MOBILE: {
    width: "100%",
    minHeight: 640,
  },
};

const SELECTION_CONFIG = {
  START_Y: 120,
  STRIPE_HEIGHT: 65,
  CHANGE_INTERVAL: 200,
  SELECTION_DURATION: 4000,
  PAUSE_DURATION: 2000,
};

function CrazyColorsGame() {
  // Game state
  const [currentScreen, setCurrentScreen] = useState(SCREENS.INTRO);
  const [gameStats, setGameStats] = useState({
    questionsAll: 0,
    answersCorrect: 0,
    answersWrong: 0,
    timeSpent: 0,
    timePerAnswer: 0,
  });
  const [settings, setSettings] = useState({
    regim: 0,
    optionIndex: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showExit, setShowExit] = useState(false);

  // Selection screen state
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [isSelectionFixed, setIsSelectionFixed] = useState(false);
  const [selectionY, setSelectionY] = useState(SELECTION_CONFIG.START_Y);

  // Main screen state
  const [currentQuestion, setCurrentQuestion] = useState({
    lettersColorIndex: 0,
    backgroundColorIndex: 1, // Different from lettersColorIndex
    textSelected: 0,
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  /* const [timer, setTimer] = useState(null); */

  // Device detection state
  const [deviceType, setDeviceType] = useState(getWindowDimensions());

  const [selectedButtonIndex, setSelectedButtonIndex] = useState(null);

  // Handle window resize
  useLayoutEffect(() => {
    function updateSize() {
      setDeviceType(getWindowDimensions());
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && !showAnswer) {
        setShowExit(true);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showAnswer]);

  // Selection screen animation
  // Selection screen animation
  useEffect(() => {
    if (currentScreen === SCREENS.SELECTION && !isSelectionFixed) {
      const changeInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * COLOR_NAMES.length);
        setSelectionIndex(randomIndex);
        setSelectionY(
          SELECTION_CONFIG.START_Y +
            randomIndex * SELECTION_CONFIG.STRIPE_HEIGHT
        );
      }, SELECTION_CONFIG.CHANGE_INTERVAL);

      const fixTimeout = setTimeout(() => {
        clearInterval(changeInterval);
        setIsSelectionFixed(true);
        setTimeout(() => {
          setCurrentScreen(SCREENS.MAIN);
          setIsSelectionFixed(false);
        }, SELECTION_CONFIG.PAUSE_DURATION);
      }, SELECTION_CONFIG.SELECTION_DURATION);

      return () => {
        clearInterval(changeInterval);
        clearTimeout(fixTimeout);
      };
    }
  }, [currentScreen, isSelectionFixed]);

  // Timer for main screen
  useEffect(() => {
    if (currentScreen === SCREENS.MAIN && !showAnswer) {
      const interval = setInterval(() => {
        setGameStats((prev) => ({
          ...prev,
          timeSpent: prev.timeSpent + 1,
          timePerAnswer:
            prev.questionsAll > 0
              ? Math.round(prev.timeSpent / prev.questionsAll)
              : 0,
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen, showAnswer]);

  const generateNewQuestion = useCallback(() => {
    let lettersIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    let bgIdx;
    do {
      bgIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    } while (bgIdx === lettersIdx);

    /* setCurrentQuestion((prev) => ({ */
    setCurrentQuestion({
      lettersColorIndex: lettersIdx,
      backgroundColorIndex: bgIdx,
      textSelected: selectionIndex,
    });
  }, [selectionIndex]);

  // Call generateNewQuestion when entering MAIN screen
  useEffect(() => {
    if (currentScreen === SCREENS.MAIN) {
      generateNewQuestion();
    }
  }, [currentScreen, generateNewQuestion]);

  const handleAnswer = (answerIndex) => {
    setSelectedButtonIndex(answerIndex);
    const isCorrect =
      (settings.regim === 1
        ? Math.floor(Math.random() * 2)
        : settings.optionIndex) === 0
        ? answerIndex === currentQuestion.lettersColorIndex
        : answerIndex === currentQuestion.backgroundColorIndex;

    setIsAnswerCorrect(isCorrect);
    setShowAnswer(true);
  };

  const resetGame = () => {
    setGameStats({
      questionsAll: 0,
      answersCorrect: 0,
      answersWrong: 0,
      timeSpent: 0,
      timePerAnswer: 0,
    });
    setCurrentScreen(SCREENS.INTRO);
    setShowExit(false);
  };

  // Components
  const IntroScreen = () => (
    // <div className="h-screen bg-gradient-to-b from-black via-red-500 to-violet-600">
    <div 
      className="h-screen" 
      style={{
        background: "linear-gradient(to bottom, #000000, #FF0000, #FFA500, #FFFF00, #008000, #0000FF, #4B0082, #9400D3)"
      }}
    >    
      <div className="flex flex-col justify-between h-full py-16">
        <div className="w-full">
          {/* Position from top */}
          {/* <h1 className="text-8xl font-bold text-white mb-8 text-center"> */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 md:mb-8 text-center">            
            Crazy Colors
          </h1>
        <div className="text-center" style={{ color: "#1900d7" }}>
          <p className="text-8xl md:text-5xl lg:text-7xl font-semibold mb-2">Укажите цвет</p>
          <p className="text-6xl md:text-3xl lg:text-6xl font-semibold" style={{ color: "#3700a4" }}>букв или фона</p>
        </div>
      </div>
      {/* <div className="w-full max-w-xs mx-auto">         */}
      {/* <div className="mb-12 md:mb-60 w-full max-w-xs mx-auto">         */}
      {/* <div className="mb-6 md:mb-60 w-full max-w-xs mx-auto">  */}
      <div className="mb-[10vh] w-full max-w-xs mx-auto">        
        {/* Position buttons from bottom */}
        {/* <div className="flex flex-col gap-4 items-center"> */}
        <div className="flex flex-col gap-2 md:gap-4 items-center">          
          <button
            onClick={() => setCurrentScreen(SCREENS.SELECTION)}
            // className="text-white px-6 py-4 md:px-8 md:py-3 rounded-lg hover:scale-110 transition-all duration-300 font-bold w-36 md:w-48 text-sm md:text-base"
            className="text-white px-3 py-2 md:px-8 md:py-3 rounded-lg hover:scale-110 transition-all duration-300 font-bold w-24 md:w-48 text-sm md:text-base text-center"
            style={{
              backgroundColor: "#a00000",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = PRESSED_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#a00000";
            }}
          >
            START
          </button>
          <button
            onClick={() => setShowSettings(true)}
            // className="text-white px-6 py-4 md:px-8 md:py-3 rounded-lg hover:scale-110 transition-all duration-300 font-bold w-36 md:w-48 text-sm md:text-base"
            className="text-white px-3 py-2 md:px-8 md:py-3 rounded-lg hover:scale-110 transition-all duration-300 font-bold w-24 md:w-48 text-sm md:text-base text-center"
            style={{
              backgroundColor: "#b80000"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = PRESSED_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#b80000";
            }}
          >
            SETTINGS
          </button>
          <button
            onClick={() => setShowExit(true)}
            // className="text-white px-6 py-4 md:px-8 md:py-3 rounded-lg hover:scale-110 transition-all duration-300 font-bold w-36 md:w-48 text-sm md:text-base"
            className="text-white px-3 py-2 md:px-8 md:py-3 rounded-lg hover:scale-110 transition-all duration-300 font-bold w-24 md:w-48 text-sm md:text-base text-center"
            style={{
              backgroundColor: "#ec0000",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}            
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = PRESSED_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ec0000";
            }}
          >
            INFO
          </button>
        </div>
      </div>
      </div>
      </div>
  );

  const SelectionScreen = () => {
    return (
      <div className="h-screen w-full relative overflow-hidden">
        {/* Title */}
        <h1
          // className="absolute top-4 md:top-2 left-0 right-0 text-6xl md:text-8xl font-bold text-center z-20"
          className="absolute top-10 md:top-2 left-0 right-0 text-4xl md:text-8xl font-bold text-center z-20"          
          style={{ color: "#1974d2 !important"}}
        >
          {/* {" "} */}
          {/* navy color? black? */}
          Crazy Colors
        </h1>
        {/* Color stripes */}
        <div
          className={`absolute inset-0 flex flex-col items-center ${
            // deviceType.isMobile ? "scale-75" : ""
            deviceType.isMobile ? "scale-75 -translate-y-10" : ""            
          }`}
        >
          {COLOR_CODES.map((color, index) => (
            <div
              key={index}
              className="absolute w-full"
              style={{
                backgroundColor: color,
                height: `${SELECTION_CONFIG.STRIPE_HEIGHT}px`,
                top: `${
                  SELECTION_CONFIG.START_Y +
                  index * SELECTION_CONFIG.STRIPE_HEIGHT
                }px`,
              }}
            />
          ))}
        </div>

        {/* Moving/Selected word */}
        <button
          className={`absolute left-1/2 transform -translate-x-1/2 px-4 py-2 md:px-4 md:py-2 rounded-lg text-white font-bold z-10 text-sm
            ${
              isSelectionFixed
              // ? "transition-all duration-500"
              // : "transition-all duration-300"
              ? "transition-all duration-200"
                : "transition-all duration-150"
            }
            ${deviceType.isMobile ? "scale-75" : ""}`}
          style={{
            top: isSelectionFixed
              ? `${
                  SELECTION_CONFIG.START_Y +
                  4 * SELECTION_CONFIG.STRIPE_HEIGHT +
                  SELECTION_CONFIG.STRIPE_HEIGHT / 2
                }px`
              : `${selectionY + SELECTION_CONFIG.STRIPE_HEIGHT / 2}px`,
            backgroundColor: "#C0C0C0",
            color: "#FFFFFF",
            transform: `translate(-50%, -50%) ${
              isSelectionFixed ? "scale(3)" : "scale(2)"
            }`,
          }}
        >
          {COLOR_NAMES[selectionIndex]}
        </button>
      </div>
    );
  };

  const MainScreen = () => (
    <div className="h-screen w-full flex flex-col p-4 bg-gray-100">
      {/* Section 1: Title */}
      <div className="flex items-center justify-center h-16 md:h-24 mb-4">
        <div className="p-2 rounded" style={{
          background: "linear-gradient(to right, #9400D3, #4B0082, #0000FF, #008000, #FFFF00, #FFA500, #FF0000)",
          border: "2px solid transparent",
          borderImage: "linear-gradient(to right, #FF0000, #FFA500, #FFFF00, #008000, #0000FF, #4B0082, #9400D3) 1",
        }}>
          <h2
            className="text-4xl md:text-5xl font-bold text-center"
            style={{
              background: "linear-gradient(to right, #FFFF00, #FFA500, #a50000, #ffffff, #fff400, #4B0082, #9400D3, #FF0000, #000000, #008000, #0000FF)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              letterSpacing: "0.05em",
              margin: 0,
              padding: "4px"
            }}
          >
            {
              OPTIONS[
                settings.regim === 1
                  ? Math.floor(Math.random() * 2)
                  : settings.optionIndex
              ]
            }
          </h2>
        </div>
      </div>

      {/* Section 2: Statistics */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 relative">
        <button 
          // onClick={() => setCurrentScreen(SCREENS.INTRO)}
          onClick={() => setShowExit(true)}          
          // className="absolute -top-3 -right-3 md:top-1 md:right-1 w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none z-10"
          className="absolute top-2 -right-3 md:top-1 md:right-1 w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none z-10"
          aria-label="Return to intro"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>Всего вопросов: {gameStats.questionsAll}</p>
            <p className="text-green-600">
              Правильно: {gameStats.answersCorrect}
            </p>
            <p className="text-red-600">Неверно: {gameStats.answersWrong}</p>
          </div>
          <div>
            <p>
              Время: {Math.floor(gameStats.timeSpent / 60)}:
              {(gameStats.timeSpent % 60).toString().padStart(2, "0")}
            </p>
            <p>Среднее время: {gameStats.timePerAnswer}с</p>
          </div>
        </div>
      </div>

      {/* Section 3: Color Display */}
      <div
        className="p-8 rounded-lg mb-6 md:mb-8 flex items-center justify-center text-5xl md:text-7xl font-bold h-40 md:h-64 leading-loose"
        // className="p-8 rounded-lg mb-6 md:mb-8 flex items-center justify-center text-5xl md:text-7xl font-bold h-48 md:h-64 leading-loose"
        style={{
          backgroundColor: COLOR_CODES[currentQuestion.backgroundColorIndex],
          color: COLOR_CODES[currentQuestion.lettersColorIndex],
        }}
      >
        {COLOR_NAMES[currentQuestion.textSelected]}
      </div>

      {/* Section 4: Color Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
        {COLOR_NAMES.map((name, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="text-white px-3 py-3 md:px-4 md:py-2 text-sm md:text-base font-extrabold rounded"
            style={{
              backgroundColor:
                selectedButtonIndex === index ? PRESSED_COLOR : "#000aea",
              transform:
                selectedButtonIndex === index ? "scale(0.95)" : "scale(1)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => {
              if (selectedButtonIndex === null) {
                e.currentTarget.style.backgroundColor = PRESSED_COLOR;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedButtonIndex === null) {
                e.currentTarget.style.backgroundColor = "#000aea";
              }
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Настройки</h2>
        <div className="space-y-4">
          <div>
            <input
              type="radio"
              id="colorLetters"
              checked={settings.optionIndex === 0}
              onChange={() =>
                setSettings((prev) => ({ ...prev, optionIndex: 0 }))
              }
            />
            <label htmlFor="colorLetters" className="ml-2">
              Указывать цвет букв
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="colorBackground"
              checked={settings.optionIndex === 1}
              onChange={() =>
                setSettings((prev) => ({ ...prev, optionIndex: 1 }))
              }
            />
            <label htmlFor="colorBackground" className="ml-2">
              Указывать цвет фона
            </label>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(false)}
          className="mt-6 bg-blue-500 text-white px-4 py-2 text-sm md:text-base rounded hover:bg-blue-600"
        >
          Закрыть
        </button>
      </div>
    </div>
  );

  const ExitModal = () => {
    const handleContinue = () => {
      setShowExit(false);
      if (currentScreen === SCREENS.INTRO) {
        // Already on intro screen, just close modal
      } else {
        // Return to game (main or selection) with preserved stats
        setCurrentScreen(SCREENS.SELECTION);
      }
    };
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="text-white p-4 rounded-lg mb-6" style={{backgroundColor: "#a00000"}}>
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            ИНФОРМАЦИЯ
          </h2>
        </div>
        <div className="space-y-2 mb-6">
          <p>Всего вопросов: {gameStats.questionsAll}</p>
          <p>Отвечено правильно: {gameStats.answersCorrect}</p>
          <p>Отвечено неверно: {gameStats.answersWrong}</p>
          <p>Среднее время на ответ: {gameStats.timePerAnswer} сек</p>
        </div>
        <div className="p-4 rounded-lg mb-6" style={{backgroundColor: "#d00000"}}>
          <p className="text-2xl text-white md:text-3xl font-bold text-center">
            Выберите дальнейшее действие
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
        <button
            onClick={() => {
              setShowExit(false);
              // If we came from Intro, stay there; if from Main, go back to Main
              if (currentScreen === SCREENS.MAIN) {
                // Return to Main with preserved stats
              }
            }}
            className="bg-blue-500 text-white px-3 py-3 md:px-4 md:py-2 text-sm md:text-base rounded hover:bg-green-600"
            style={{
              backgroundColor: "#000ee3"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6b238d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000ee3";
            }}            
          >
            Продолжить
          </button>
          <button
            onClick={() => {
              setShowExit(false);
              setCurrentScreen(SCREENS.SELECTION)}
            }
            className="bg-blue-500 text-white px-3 py-3 md:px-4 md:py-2 text-sm md:text-base rounded hover:bg-blue-600"
            style={{
              backgroundColor: "#000ee3"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6b238d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000ee3";
            }}            
          >
            Начать заново
          </button>
          <button
            onClick={() => {
              setShowExit(false);
              setShowSettings(true);
            }}
            className="bg-blue-500 text-white px-3 py-3 md:px-4 md:py-2 text-sm md:text-base rounded hover:bg-green-600"
            style={{
              backgroundColor: "#000ee3"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6b238d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000ee3";
            }}            
          >
            Настройки
          </button>
          <button
            onClick={resetGame}
            className="bg-blue-500 text-white px-3 py-3 md:px-4 md:py-2 text-sm md:text-base rounded hover:bg-blue-600"
            style={{
              backgroundColor: "#000ee3"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6b238d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000ee3";
            }}            
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
    );
  };

  const AnswerModal = () => {
    // Handle any key press except ESC
    useEffect(() => {
      const handleKeyPress = (event) => {
        if (event.key === "Escape") {
          setShowAnswer(false);
          setShowExit(true);
        } else {
          setShowAnswer(false);
          setCurrentScreen(SCREENS.SELECTION);
        }
      };
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center"
        style={{ paddingTop: "15vh" }}
        onClick={() => {
          setGameStats((prev) => ({
            ...prev,
            questionsAll: prev.questionsAll + 1,
            answersCorrect: prev.answersCorrect + (isAnswerCorrect ? 1 : 0),
            answersWrong: prev.answersWrong + (isAnswerCorrect ? 0 : 1),
          }));
          setSelectedButtonIndex(null); // Reset button state
          setShowAnswer(false);
          setCurrentScreen(SCREENS.SELECTION);
        }}
      >
        <div
          className="rounded-lg w-96 flex flex-col items-center"
          style={{
            backgroundColor: isAnswerCorrect ? "#7DF9FF" : "#FAA0A0",
            height: "fit-content",
            padding: "2rem",
          }}
        >
          <h2 className="text-2xl font-bold mb-6">
            {isAnswerCorrect ? "Это верный ответ!" : "Неправильно!"}
          </h2>
          <p className="mb-8">Для продолжения нажмите любую кнопку</p>
          <button
            onClick={() => {
              setGameStats((prev) => ({
                ...prev,
                questionsAll: prev.questionsAll + 1,
                answersCorrect: prev.answersCorrect + (isAnswerCorrect ? 1 : 0),
                answersWrong: prev.answersWrong + (isAnswerCorrect ? 0 : 1),
              }));
              setSelectedButtonIndex(null); // Reset button state
              setShowAnswer(false);
              setCurrentScreen(SCREENS.SELECTION);
            }}
            className="bg-blue-500 text-white px-8 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Продолжить
          </button>
        </div>
      </div>
    );
  };

  // Main render logic
  return (
    <div
      // className="relative bg-white shadow-lg overflow-hidden w-full max-w-md mx-auto"
      className="relative bg-white shadow-lg overflow-hidden mx-auto"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: deviceType.isMobile ? "100%" : "600px",
        height: deviceType.isMobile ? "100%" : "720px",
        maxWidth: "100vw",
        maxHeight: "100vh",
        border: "2px solid black",
        WebkitTapHighlightColor: "transparent",
        caretColor: "transparent"
      }}
    >
      {currentScreen === SCREENS.INTRO && <IntroScreen />}
      {currentScreen === SCREENS.SELECTION && <SelectionScreen />}
      {currentScreen === SCREENS.MAIN && <MainScreen />}
      {showSettings && <SettingsModal />}
      {showExit && <ExitModal />}
      {showAnswer && <AnswerModal />}
    </div>
  );
}

export default CrazyColorsGame;
