const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: Number,
  text: String,
  type: String,
  priority: { type: String, default: "medium" }, // added priority with a default value
  reminder: { type: String, default: "" }, // added reminder with a default value
});

const userSchema = new mongoose.Schema({
  userID: String,
  email: { type: String, unique: true, required: true }, // Add this to ensure email is unique
  name: String,
  cards: [[itemSchema]],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
