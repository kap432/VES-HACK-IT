const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Progress = require("../models/Progress");

const router = express.Router();

// ✅ Save game progress
router.post("/progress", authMiddleware, async (req, res) => {
  try {
    const { gameId, score, completed } = req.body;

    // Validate required fields
    if (!gameId || score === undefined || completed === undefined) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    // Ensure gameId is a string
    if (typeof gameId !== "string") {
      return res.status(400).json({ msg: "Invalid gameId format. Must be a string." });
    }

    // Create and save progress
    const progress = new Progress({
      user: req.user.id,
      gameId, // Accepts "memory_match"
      score,
      completed,
      date: new Date(),
    });

    await progress.save();
    res.status(201).json({ msg: "Progress saved successfully!", progress });
  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Fetch user's progress
router.get("/progress", authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id });

    if (!progress.length) {
      return res.status(404).json({ msg: "No progress found" });
    }

    res.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
