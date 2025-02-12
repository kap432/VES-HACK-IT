const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Sample Games Data
const games = [
  {
    id: 1,
    title: "Memory Match",
    description: "Match similar cards in the shortest time.",
  },
  {
    id: 2,
    title: "Math Quiz",
    description: "Solve basic math problems under time pressure.",
  },
  {
    id: 3,
    title: "Word Scramble",
    description: "Rearrange letters to form a correct word.",
  },
];

// Sample Progress Data
const progressData = {
  gamesPlayed: [
    { game: "Memory Match", score: 80 },
    { game: "Math Quiz", score: 90 },
  ],
};

// Get Available Games
router.get("/games", authMiddleware, (req, res) => {
  res.json(games);
});

// Get User Progress
router.get("/progress", authMiddleware, (req, res) => {
  res.json(progressData);
});

module.exports = router;
