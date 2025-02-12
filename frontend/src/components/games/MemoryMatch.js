import React, { useState, useEffect, useCallback } from "react";
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

// Function to shuffle and assign unique IDs
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
  const token = localStorage.getItem("token");

  useEffect(() => {
    setCards(shuffledCards());
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (first.name === second.name) {
        setMatchedCards((prev) => [...prev, first.name]);
      }
      setTimeout(() => setFlippedCards([]), 800);
    }
  }, [flippedCards]);

  const sendProgressToBackend = useCallback(async () => {
    if (matchedCards.length !== cardImages.length) return; // Only send when game is completed

    const payload = {
      gameId: "memory_match",
      score: matchedCards.length,
      completed: true,
    };

    console.log("Sending progress data:", payload);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/games/progress",
        payload,
        {
          headers: { "x-auth-token": token, "Content-Type": "application/json" },
        }
      );
      console.log("Progress saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving progress:", error.response?.data || error.message);
    }
  }, [matchedCards, token]);

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
  };

  return (
    <div className="memory-container">
      <h2>Memory Match Game</h2>
      {gameOver ? (
        <>
          <h3 className="game-over">🎉 You won! Play again?</h3>
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
