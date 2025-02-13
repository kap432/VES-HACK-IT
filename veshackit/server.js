require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

// Import Passport authentication
require("./auth/googleAuth");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Express session middleware (Required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import Routes
const authRoutes = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const gameRoutes = require("./routes/games");
const doctorRoutes = require("./routes/doctor");
const patientRoutes = require("./routes/patient"); // Added patient routes
const guardianRoutes = require("./routes/guardian");
// ...

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes); // New route for patients
app.use("/api/guardian", guardianRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
