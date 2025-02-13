import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./FamilyTreeGame.css";

// Define family trees for different difficulty levels
const easyTree = [
  { id: 1, name: "👴 Grandfather", relation: "Grandfather", position: "top", placed: true },
  { id: 2, name: "👵 Grandmother", relation: "Grandmother", position: "top", placed: true },
  { id: 3, name: "👨 Father", relation: "Father", position: "middle", placed: false },
  { id: 4, name: "👩 Mother", relation: "Mother", position: "middle", placed: false },
  { id: 5, name: "🧒 You", relation: "Child", position: "bottom", placed: false },
];

const mediumTree = [
  { id: 1, name: "👴 Great-Grandfather", relation: "Great-Grandfather", position: "top", placed: true },
  { id: 2, name: "👵 Great-Grandmother", relation: "Great-Grandmother", position: "top", placed: true },
  { id: 3, name: "🧓 Grandfather", relation: "Grandfather", position: "upper-middle", placed: false },
  { id: 4, name: "👩‍🦳 Grandmother", relation: "Grandmother", position: "upper-middle", placed: false },
  { id: 5, name: "👨 Father", relation: "Father", position: "middle", placed: false },
  { id: 6, name: "👩 Mother", relation: "Mother", position: "middle", placed: false },
  { id: 7, name: "🧒 You", relation: "Child", position: "bottom", placed: false },
  { id: 8, name: "👧 Sibling", relation: "Sibling", position: "bottom", placed: false },
];

const hardTree = [
  { id: 1, name: "👴 Great-Grandfather 1", relation: "Great-Grandfather", position: "top", placed: true },
  { id: 2, name: "👵 Great-Grandmother 2", relation: "Great-Grandmother", position: "top", placed: true },
  { id: 3, name: "🧓 Grandfather 1", relation: "Grandfather", position: "upper-middle", placed: false },
  { id: 4, name: "👩‍🦳 Grandmother 2", relation: "Grandmother", position: "upper-middle", placed: false },
  { id: 5, name: "👨 Father", relation: "Father", position: "middle", placed: false },
  { id: 6, name: "👩 Mother", relation: "Mother", position: "middle", placed: false },
  { id: 7, name: "🧔 Paternal Uncle", relation: "Paternal Uncle", position: "middle", placed: false },
  { id: 8, name: "👩‍🦰 Maternal Aunt", relation: "Maternal Aunt", position: "middle", placed: false },
  { id: 9, name: "🧒 Child", relation: "Child", position: "bottom", placed: false },
  { id: 10, name: "👧 Sibling", relation: "Sibling", position: "bottom", placed: false },
  { id: 11, name: "👦 First Cousin", relation: "First Cousin", position: "bottom", placed: false },
  { id: 12, name: "👶 Baby Cousin", relation: "Baby Cousin", position: "bottom", placed: false },
];

const MAX_LEVEL = 3;

const FamilyTreeGame = () => {
  const navigate = useNavigate();

  // Game state variables
  const [currentLevel, setCurrentLevel] = useState(1);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [accumulatedMistakes, setAccumulatedMistakes] = useState(0);
  const [tree, setTree] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Sound Effects
  const correctSound = new Audio("/success-point.mp3");
  const winSound = new Audio("/family-tree-win.mp3");
  const wrongSound = new Audio("/family-tree-wrong.mp3");

  // Function to get family tree based on current level
  const getTreeForLevel = (level) => {
    if (level === 1) return easyTree;
    else if (level === 2) return mediumTree;
    else return hardTree;
  };

  // Function to select a random unplaced card from the tree
  const getRandomCurrentCard = (treeArray) => {
    const unplacedCards = treeArray.filter((c) => !c.placed);
    return unplacedCards.length > 0
      ? unplacedCards[Math.floor(Math.random() * unplacedCards.length)]
      : null;
  };

  // Reset game state without affecting accumulatedTime or accumulatedMistakes
  const resetGame = (level) => {
    const newTree = getTreeForLevel(level);
    setTree(newTree);
    setCurrentCard(getRandomCurrentCard(newTree));
    setScore(0);
    setTimeElapsed(0);
    setHistory([]);
    setGameCompleted(false);
    setGameStarted(false);
    setMistakes(0);
  };

  // On initial load or when currentLevel changes, check for an existing session; don't auto-create a new one.
  useEffect(() => {
    const savedSessionId = localStorage.getItem("familyTreeSessionId");
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
    resetGame(currentLevel);
  }, [currentLevel]);

  // Timer effect: starts only when game is started.
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    if (timeElapsed > 0 && tree.length > 0 && tree.every((slot) => slot.placed)) {
      clearInterval(timer);
      winSound.play();
      setGameCompleted(true);
      // Accumulate time and mistakes for the finished level
      setAccumulatedTime((prev) => prev + timeElapsed);
      setAccumulatedMistakes((prev) => prev + mistakes);
      // After a short delay, update progress to backend for the finished level
      setTimeout(() => {
        updateProgress();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [tree, winSound, gameStarted, timeElapsed, gameCompleted, mistakes]);

  // Function to start a new session (only when Start Game or Restart is clicked)
  const startSession = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/games/start",
        { gameId: "family_tree", gameName: "Family Tree Game", startLevel: 1 },
        { headers: { "x-auth-token": localStorage.getItem("token"), "Content-Type": "application/json" } }
      );
      setSessionId(response.data.sessionId);
      localStorage.setItem("familyTreeSessionId", response.data.sessionId);
      console.log("New session started:", response.data.sessionId);
    } catch (error) {
      console.error("Error starting session:", error.response?.data || error.message);
    }
  };

  // Function to update progress to backend when game is complete.
  // Total time is calculated as accumulatedTime + timeElapsed for the final level.
  // Total mistakes is the sum of accumulatedMistakes and the current level mistakes.
  const updateProgress = async () => {
    try {
      const totalTime = accumulatedTime + timeElapsed;
      const totalMistakes = accumulatedMistakes + mistakes;
      const payload = {
        sessionId,
        gameId: "family_tree",
        score,
        completed: true,
        mistakes: totalMistakes,
        endLevel: currentLevel,
        totalTime: `${totalTime}s`,
      };
      console.log("Sending progress data:", payload);
      const response = await axios.post(
        "http://localhost:5000/api/games/progress",
        payload,
        { headers: { "x-auth-token": localStorage.getItem("token"), "Content-Type": "application/json" } }
      );
      console.log("Progress saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving progress:", error.response?.data || error.message);
    }
  };

  // Handler for starting the game: if no session exists, create one, then start.
  const handleStartGame = () => {
    if (!sessionId) {
      startSession();
    }
    setGameStarted(true);
  };

  // Handler for restarting the game: clear everything, reset to level 1, clear accumulated values, and require the player to click Start.
  const handleRestartGame = () => {
    localStorage.removeItem("familyTreeSessionId");
    setSessionId(null);
    setCurrentLevel(1);
    setAccumulatedTime(0);
    setAccumulatedMistakes(0);
    resetGame(1);
    // Do not automatically start; let the player click Start Game.
  };

  // Handler for exiting the game: clear the session, reset state, and navigate back.
  const handleExitGame = () => {
    localStorage.removeItem("familyTreeSessionId");
    setSessionId(null);
    resetGame(currentLevel);
    setGameStarted(false);
    navigate("/dashboard"); // Adjust route as needed.
  };

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData("cardId", cardId);
  };

  const handleDrop = (e, position) => {
    e.preventDefault();
    const draggedCardId = parseInt(e.dataTransfer.getData("cardId"));
    const draggedCard = tree.find((c) => c.id === draggedCardId);

    if (draggedCard && draggedCard.position === position && draggedCard.id === currentCard.id) {
      setHistory((prevHistory) => [
        ...prevHistory,
        { tree: [...tree], currentCard, score },
      ]);

      setTree((prevTree) => {
        const updatedTree = prevTree.map((card) =>
          card.id === draggedCard.id ? { ...card, placed: true } : card
        );
        const unplacedCards = updatedTree.filter((c) => !c.placed);
        setCurrentCard(getRandomCurrentCard(updatedTree));
        setScore((prevScore) => prevScore + 10);
        correctSound.play();
        return updatedTree;
      });
    } else {
      setMistakes((prev) => prev + 1);
      wrongSound.play();
    }
  };

  // Handler for undoing the last move
  const handleUndo = () => {
    if (tree.every((slot) => slot.placed)) return;
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setTree(lastState.tree);
    setCurrentCard(lastState.currentCard);
    setScore(lastState.score);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  };

  // Handler for proceeding to the next level manually (session continues across levels)
  const handleNextLevel = () => {
    if (currentLevel < MAX_LEVEL) {
      setCurrentLevel((prevLevel) => prevLevel + 1);
      resetGame(currentLevel + 1);
      // The accumulatedTime and accumulatedMistakes are kept across levels.
    } else {
      alert("You've reached the highest level!");
    }
  };

  const levelsOrder = ["top", "upper-middle", "middle", "bottom"];

  // Animation variants for enhanced visual effects
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hover: { scale: 1.2, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    placed: { scale: [1, 1.2, 1] },
  };

  return (
    <div className="game-container">
      {/* Header */}
      <motion.div id="header" variants={headerVariants} initial="hidden" animate="visible">
        <span>🌳 Family Tree Game - Level {currentLevel}</span>
        <span className="score">Score: {score}</span>
        <span className="timer">Time: {timeElapsed} sec</span>
        <span className="mistakes">Mistakes: {accumulatedMistakes + mistakes}</span>
        <button
          className="help-btn"
          onClick={() =>
            alert(
              "Drag the card to its correct position. Earn points, undo mistakes, and complete the family tree. When you win, click 'Next Level' to advance. Click 'Start Game' when you're ready. Use 'Restart' to begin a new session, or 'Exit' to quit."
            )
          }
        >
          Help
        </button>
        <button className="undo-btn" onClick={handleUndo} disabled={history.length === 0 || tree.every((slot) => slot.placed)}>
          Undo
        </button>
        {gameCompleted && currentLevel < MAX_LEVEL && (
          <button className="next-level-btn" onClick={handleNextLevel}>
            Next Level
          </button>
        )}
        <button className="restart-btn" onClick={handleRestartGame}>
          Restart
        </button>
        <button className="exit-btn" onClick={handleExitGame}>
          Exit
        </button>
      </motion.div>

      {/* Start Button */}
      {!gameStarted && !tree.every((slot) => slot.placed) && (
        <button className="start-btn" onClick={handleStartGame}>
          Start Game
        </button>
      )}

      {/* Family Tree */}
      <div className="family-tree">
        {levelsOrder.map((level, index) => (
          <React.Fragment key={level}>
            <div className={`tree-level ${level}`}>
              {tree
                .filter((item) => item.position === level)
                .map((slot) => (
                  <motion.div
                    key={slot.id}
                    className="tree-node"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, slot.position)}
                    variants={nodeVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {slot.placed && (
                      <motion.div className="card placed" variants={nodeVariants} animate="placed" transition={{ duration: 0.3 }}>
                        <strong>{slot.name}</strong>
                        <p className="relation">{slot.relation}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
            </div>
            {index < levelsOrder.length - 1 && <div className="connector" />}
          </React.Fragment>
        ))}
      </div>

      {/* Draggable Card */}
      <AnimatePresence>
        {gameStarted && currentCard && !currentCard.placed && (
          <motion.div
            className="drag-card"
            draggable
            onDragStart={(e) => handleDragStart(e, currentCard.id)}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <strong>{currentCard.name}</strong>
            <p className="relation">{currentCard.relation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win Message */}
      <AnimatePresence>
        {tree.every((slot) => slot.placed) && (
          <motion.div
            className="win-message"
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            🎉 You completed the family tree!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyTreeGame;
