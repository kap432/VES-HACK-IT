// veshackit/routes/detail.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Detail = require("../models/Detail");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Ensure this folder exists and is accessible (e.g., create an "uploads" folder)
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      // Append a timestamp to avoid name collisions
      cb(null, Date.now() + "_" + file.originalname);
    },
  });
  const upload = multer({ storage: storage });

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
  
// POST /api/detail/photo - Upload/update profile photo for the current user
router.post("/photo", authMiddleware, upload.single("profilePic"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded." });
      }
      // You may want to adjust the file path to a URL accessible by your frontend.
      // For this example, we'll just use the relative path.
      const filePath = req.file.path;
  
      // Update the detail document with the new profilePic path
      const updatedDetail = await Detail.findOneAndUpdate(
        { user: req.user.id },
        { profilePic: filePath },
        { new: true }
      );
      if (!updatedDetail) {
        return res.status(404).json({ msg: "Profile detail not found." });
      }
      res.json({ msg: "Profile photo updated successfully", detail: updatedDetail });
    } catch (error) {
      console.error("Error updating profile photo:", error);
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
      const { name, email, age, gender, birthdate } = req.body;
      
      // Convert and sanitize values:
      const updateData = {
        name,
        email,
        age: age && age.trim() !== "" ? Number(age) : null,
        gender: gender && gender.trim() !== "" ? gender : null,
        birthdate: birthdate && birthdate.trim() !== "" ? new Date(birthdate) : null,
      };
  
      const updatedDetail = await Detail.findOneAndUpdate(
        { user: req.user.id },
        updateData,
        { new: true, upsert: false }
      );
      if (!updatedDetail) {
        return res.status(404).json({ msg: "Profile detail not found." });
      }
      res.json({ msg: "Profile updated successfully", detail: updatedDetail });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });

module.exports = router;
