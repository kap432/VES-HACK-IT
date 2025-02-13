const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  }, // The patient (player) to whom the task is assigned
  taskDescription: { 
    type: String, 
    required: true 
  }, // e.g., "Morning walk"
  startTime: { 
    type: String, 
    required: true 
  }, // e.g., "7:00 AM"
  endTime: { 
    type: String, 
    required: true 
  }, // e.g., "7:30 AM"
  // Optional: You can also store the task date if needed.
  taskDate: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Prevents model re-compilation issues
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
module.exports = Task;
