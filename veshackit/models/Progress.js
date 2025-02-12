const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gameId: { type: String, required: true }, // Now storing as a string
  score: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);

module.exports = Progress;
