import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./MemoryMatch.css";

const cardImages = [
  { name: "🍎" },
  { name: "🍌" },
  { name: "🍉" },
  { name: "🍇" },
  { name: "🍓" },
  { name: "🍍" },
];

const shuffledCards = () => {
  return [...cardImages, ...cardImages]
    .sort(() => Math.random() - 0.5)
    .map((card, index) => ({ ...card, id: index, matched: false }));
};

const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [startLevel] = useState(1); // Default start level
  const [endLevel, setEndLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  const hasStartedSession = useRef(false);

  const token = localStorage.getItem("token");

  const startNewSession = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/games/start",
        { gameId: "memory_match", gameName: "Memory Match", startLevel },
        { headers: { "x-auth-token": token, "Content-Type": "application/json" } }
      );
      setSessionId(response.data.sessionId);
      console.log("New session started:", response.data.sessionId);
    } catch (error) {
      console.error("Error starting session:", error.response?.data || error.message);
    }
  }, [token, startLevel]);

  useEffect(() => {
    setCards(shuffledCards());
    setMistakes(0);
    setTimeElapsed(0);
    setEndLevel(startLevel);

    if (!sessionId && !hasStartedSession.current) {
      hasStartedSession.current = true;
      startNewSession();
    }

    // Start the game timer
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current); // Cleanup timer on unmount
  }, [startNewSession, sessionId, startLevel]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (first.name === second.name) {
        setMatchedCards((prev) => [...prev, first.name]);
      } else {
        setMistakes((prev) => prev + 1);
      }
      setTimeout(() => setFlippedCards([]), 800);
    }
  }, [flippedCards]);

  const sendProgressToBackend = useCallback(async () => {
    if (matchedCards.length !== cardImages.length || !sessionId) return;

    const payload = {
      sessionId,
      gameId: "memory_match",
      score: matchedCards.length,
      completed: true,
      mistakes,
      endLevel,
      totalTime: `${timeElapsed}s`, // Send total time in seconds
    };

    console.log("Sending progress data:", payload);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/games/progress",
        payload,
        { headers: { "x-auth-token": token, "Content-Type": "application/json" } }
      );
      console.log("Progress saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving progress:", error.response?.data || error.message);
    }
  }, [matchedCards, sessionId, token, mistakes, endLevel, timeElapsed]);

  useEffect(() => {
    if (matchedCards.length === cardImages.length && !gameOver) {
      setGameOver(true);
      clearInterval(timerRef.current); // Stop timer
      setEndLevel((prev) => prev + 1); // Increment level
      sendProgressToBackend();
    }
  }, [matchedCards, sendProgressToBackend, gameOver]);
  
  const handleCardClick = (card) => {
    if (
      flippedCards.length < 2 &&
      !flippedCards.includes(card) &&
      !matchedCards.includes(card.name)
    ) {
      setFlippedCards((prev) => [...prev, card]);
    }
  };

  const restartGame = () => {
    setCards(shuffledCards());
    setFlippedCards([]);
    setMatchedCards([]);
    setGameOver(false);
    setMistakes(0);
    setSessionId(null);
    setTimeElapsed(0);
    hasStartedSession.current = false;
    startNewSession();
  };

  return (
    <div className="memory-container">
      <h2>Memory Match Game</h2>
      <p>⏳ Time: {timeElapsed}s</p>
      <p>❌ Mistakes: {mistakes}</p>
      <p>🏆 Level: {endLevel}</p>

      {gameOver ? (
        <>
          <h3 className="game-over">🎉 You won! Play again?</h3>
          <p>⏳ Total Time: {timeElapsed}s</p>
          <p>❌ Total Mistakes: {mistakes}</p>
          <button className="restart-btn" onClick={restartGame}>
            Restart Game 🔄
          </button>
        </>
      ) : (
        <div className="card-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`card ${flippedCards.includes(card) || matchedCards.includes(card.name) ? "flipped" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              {flippedCards.includes(card) || matchedCards.includes(card.name) ? card.name : "❓"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
