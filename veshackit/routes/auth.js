const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Register User (Manual Registration)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔹 Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields (name, email, password, role) are required" });
    }

    // 🔹 Validate role (must be 'player' or 'doctor')
    if (!["player", "doctor"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role. Choose 'player' or 'doctor'." });
    }

    // 🔹 Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // 🔹 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔹 Create new user
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // 🔹 Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ msg: "User registered successfully", token, user: { id: user._id, name, email, role } });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Login User (Manual Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // 🔹 Check if user registered with Google
    if (!user.password) return res.status(400).json({ msg: "Use Google login" });

    // 🔹 Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // 🔹 Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Google Authentication (Login Only)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const { email, name, googleId } = req.user;
      let user = await User.findOne({ email });

      if (!user) {
        return res.redirect("http://localhost:3000/login?error=unregistered");
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    } catch (error) {
      console.error("Google authentication error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ✅ Logout User
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ msg: "Logout failed" });

    res.clearCookie("connect.sid");
    res.json({ msg: "Logged out successfully" });
  });
});

// ✅ Get User Data (Protected Route)
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
