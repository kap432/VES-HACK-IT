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
  const hasStartedSession = useRef(false); // Prevent duplicate session creation

  const token = localStorage.getItem("token");

  const startNewSession = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/games/start",
        { gameId: "memory_match" },
        { headers: { "x-auth-token": token, "Content-Type": "application/json" } }
      );
      setSessionId(response.data.sessionId);
      console.log("New session started:", response.data.sessionId);
    } catch (error) {
      console.error("Error starting session:", error.response?.data || error.message);
    }
  }, [token]);

  useEffect(() => {
    setCards(shuffledCards());
    setMistakes(0);

    if (!sessionId && !hasStartedSession.current) {
      hasStartedSession.current = true; // Mark as executed
      startNewSession();
    }
  }, [startNewSession, sessionId]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (first.name === second.name) {
        setMatchedCards((prev) => [...prev, first.name]);
      } else {
        setMistakes((prev) => prev + 1); // Track mistakes
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
      mistakes, // Send mistakes count
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
  }, [matchedCards, sessionId, token, mistakes]);

  useEffect(() => {
    if (matchedCards.length === cardImages.length) {
      setGameOver(true);
      sendProgressToBackend();
    }
  }, [matchedCards, sendProgressToBackend]);

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
    hasStartedSession.current = false; // Reset session tracking
    startNewSession();
  };

  return (
    <div className="memory-container">
      <h2>Memory Match Game</h2>
      <p>Mistakes: {mistakes}</p> {/* Display mistake count */}
      {gameOver ? (
        <>
          <h3 className="game-over">🎉 You won! Play again?</h3>
          <p>Total Mistakes: {mistakes}</p> {/* Show mistakes at end of game */}
          <button className="restart-btn" onClick={restartGame}>
            Restart Game 🔄
          </button>
        </>
      ) : (
        <div className="card-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`card ${
                flippedCards.includes(card) || matchedCards.includes(card.name)
                  ? "flipped"
                  : ""
              }`}
              onClick={() => handleCardClick(card)}
            >
              {flippedCards.includes(card) || matchedCards.includes(card.name)
                ? card.name
                : "❓"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
