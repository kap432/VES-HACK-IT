// veshackit/routes/detail.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Detail = require("../models/Detail");

// POST /api/detail - Create profile details for the current user
router.post("/", authMiddleware, async (req, res) => {
    try {
      const { name, email } = req.body;
      const detail = new Detail({ user: req.user.id, name, email });
      await detail.save();
      res.status(201).json({ msg: "Profile detail created successfully", detail });
    } catch (error) {
      console.error("Error creating profile detail:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });
  
// GET /api/detail - Fetch profile details for the current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const detail = await Detail.findOne({ user: req.user.id });
    if (!detail) {
      return res.status(404).json({ msg: "Profile detail not found." });
    }
    res.json(detail);
  } catch (error) {
    console.error("Error fetching profile detail:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// PATCH /api/detail - Update profile details for the current user
router.patch("/", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    // Update the Detail document for the logged-in user
    const updatedDetail = await Detail.findOneAndUpdate(
      { user: req.user.id },
      { name, email },
      { new: true }
    );
    if (!updatedDetail) {
      return res.status(404).json({ msg: "Profile detail not found." });
    }
    res.json({ msg: "Profile updated successfully", detail: updatedDetail });
  } catch (error) {
    console.error("Error updating profile detail:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
