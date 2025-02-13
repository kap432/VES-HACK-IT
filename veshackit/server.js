// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const passport = require("passport");
// const session = require("express-session");

// // Import Passport authentication
// require("./auth/googleAuth");

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// // Express session middleware (Required for Passport)
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret!",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// // Initialize Passport.js
// app.use(passport.initialize());
// app.use(passport.session());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // Import Routes
// const authRoutes = require("./routes/auth");
// const googleAuthRoutes = require("./routes/googleAuthRoutes");
// const gameRoutes = require("./routes/games");
// const doctorRoutes = require("./routes/doctor");
// const patientRoutes = require("./routes/patient"); // Added patient routes

// // Use Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/auth", googleAuthRoutes);
// app.use("/api/games", gameRoutes);
// app.use("/api/doctor", doctorRoutes);
// app.use("/api/patient", patientRoutes); // New route for patients

// // Default Route
// app.get("/", (req, res) => {
//   res.send("✅ Server is running...");
// });

// // Start the Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const auth = require("./middleware/auth");

const Message = require("./models/Message");

// Import Passport authentication
require("./auth/googleAuth");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

// Object to keep track of online users
const onlineUsers = {};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
require("./auth/googleAuth");

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
connectDB();

// Routes
const authRoutes = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const gameRoutes = require("./routes/games");
const doctorRoutes = require("./routes/doctor");
const patientRoutes = require("./routes/patient");
const chatRoutes = require("./routes/chat");

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/games", auth, gameRoutes);
app.use("/api/doctor", auth, doctorRoutes);
app.use("/api/patient", auth, patientRoutes);
app.use("/api/chat", auth, chatRoutes);

// Socket.io Chatroom Logic
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("register", (username) => {
    onlineUsers[username] = socket.id;
    socket.username = username;
    io.emit("userList", Object.keys(onlineUsers));
    console.log(`User registered: ${username} with socket id ${socket.id}`);
  });

  socket.on("sendMessage", async (msgData) => {
    try {
      const newMessage = new Message({
        ...msgData,
        sender: socket.username,
        timestamp: new Date(),
      });
      await newMessage.save();
      io.emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete onlineUsers[socket.username];
      io.emit("userList", Object.keys(onlineUsers));
      console.log(`User disconnected: ${socket.username}`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Default Route
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
