const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // ✅ Add `sparse: true`
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only if not Google auth
    },
  },
  role: { 
    type: String, 
    enum: ["player", "doctor"], 
    required: true 
  }, // Define user role
});

// Prevent overwriting the model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
