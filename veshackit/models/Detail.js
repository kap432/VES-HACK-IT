const mongoose = require("mongoose");

const detailSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  }
});

const Detail = mongoose.models.Detail || mongoose.model("Detail", detailSchema);
module.exports = Detail;
