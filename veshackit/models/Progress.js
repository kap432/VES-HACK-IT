const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import UUID for session ID

const progressSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, default: uuidv4 }, // Unique session ID
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gameId: { type: String, required: true }, // e.g., "memory_match"
  score: { type: Number, default: 0 },
  mistakes: { type: Number, default: 0 }, // ✅ Track mistakes
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);

module.exports = Progress;
