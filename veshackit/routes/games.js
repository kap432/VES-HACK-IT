const express = require("express");
const { v4: uuidv4 } = require("uuid"); // Import UUID for session ID
const authMiddleware = require("../middleware/authMiddleware");
const Progress = require("../models/Progress");

const router = express.Router();

// ✅ Start a new game session
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({ msg: "Game ID is required" });
    }

    // ✅ Create a new session entry
    const newSession = new Progress({
      sessionId: uuidv4(), // Generate unique session ID
      user: req.user.id,
      gameId,
      score: 0, // Initial score
      mistakes: 0, // ✅ Start with zero mistakes
      completed: false,
    });

    await newSession.save();

    res.status(201).json({ 
      msg: "New game session started!", 
      sessionId: newSession.sessionId 
    });
  } catch (error) {
    console.error("Error starting game session:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Save game progress
router.post("/progress", authMiddleware, async (req, res) => {
  try {
    const { sessionId, score, completed, mistakes } = req.body;

    if (!sessionId || score === undefined || completed === undefined || mistakes === undefined) {
      return res.status(400).json({ msg: "Session ID, score, mistakes, and completion status are required." });
    }

    // ✅ Find the existing session
    const progress = await Progress.findOne({ sessionId, user: req.user.id });

    if (!progress) {
      return res.status(404).json({ msg: "Session not found." });
    }

    // ✅ Update progress
    progress.score = score;
    progress.mistakes = mistakes; // ✅ Update mistakes
    progress.completed = completed;
    await progress.save();

    res.status(200).json({ msg: "Progress updated successfully!", progress });
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
