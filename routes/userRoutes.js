const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, token } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    await user.save();
    res.status(200).send({
      message: "User created/updated successfully.",
      mongoId: user._id,
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).send({ error: "Error creating/updating user." });
  }
});

router.get("/dashboard/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      console.log("backend", user.cards);
      res.status(200).send(user);
    } else {
      res.status(404).send({ error: "User not found." });
    }
  } catch (error) {
    res.status(500).send({ error: "Error fetching data." });
  }
});
router.put("/dashboard/email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).send({ error: "Invalid email provided." });
    }
    const user = await User.findOneAndUpdate(
      { email: email },
      { cards: req.body.cards },
      { new: true }
    );
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send({ error: "User not found." });
    }
  } catch (error) {
    res.status(500).send({ error: "Error updating data." });
  }
});

module.exports = router;
