const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const EDiary = require("../models/ediary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define uploads folder for e-diary voice notes
const uploadsFolder = path.join(__dirname, "../uploads/ediary");
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    // Append timestamp to avoid collisions
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// POST /api/ediary - Create a new e-diary entry
router.post("/", authMiddleware, upload.single("voiceNote"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ msg: "Title is required." });
    }
    if (!req.file) {
      return res.status(400).json({ msg: "Voice note file is required." });
    }
    // Save the file path (you can adjust this to generate a public URL if needed)
    const voiceNotePath = req.file.path;
    const entry = new EDiary({
      user: req.user.id,
      title,
      voiceNote: voiceNotePath,
    });
    await entry.save();
    res.status(201).json({ msg: "e-Diary entry created successfully", ediary: entry });
  } catch (error) {
    console.error("Error creating e-diary entry:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
