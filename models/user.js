const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: Number,
  text: String,
  type: String,
  priority: { type: String, default: "medium" },
  reminder: { type: String, default: "" },
});

const userSchema = new mongoose.Schema({
  userID: String,
  email: { type: String, unique: true, required: true },
  name: String,
  cards: [[itemSchema]],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
