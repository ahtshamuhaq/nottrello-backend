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
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find({}, "email");
    res.json(users);
  } catch (error) {
    res.status(500).send({ error: "Error fetching users." });
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
router.put("/dashboard/email/:email/card/:cardId", async (req, res) => {
  console.log("Received PUT request to update card:", req.params.cardId); // New log

  try {
    const { email, cardId } = req.params;
    const { newText, newPriority, newReminder } = req.body;

    // Logging received data
    console.log("Received Data:", { newText, newPriority, newReminder });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    const cardToUpdate = user.cards.find((card) =>
      card.some((item) => item.id == cardId)
    );
    if (!cardToUpdate) {
      return res.status(404).send({ error: "Card not found." });
    }

    const itemToUpdate = cardToUpdate.find((item) => item.id == cardId);
    if (!itemToUpdate) {
      return res.status(404).send({ error: "Item not found within card." });
    }

    // Update fields only if they are provided in request body
    if (newText) itemToUpdate.text = newText;
    if (newPriority) itemToUpdate.priority = newPriority;
    if (newReminder) itemToUpdate.reminder = newReminder;

    await user.save();

    console.log("Card updated successfully!"); // New log
    res.status(200).send(user);
  } catch (error) {
    console.error("Error updating card:", error); // Improved error log
    res.status(500).send({ error: "Internal Server Error." });
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
