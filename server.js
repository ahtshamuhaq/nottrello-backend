const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const admin = require("firebase-admin");
const serviceAccount = require("./config/emailpasswordlogin-d7540-firebase-adminsdk-tlcpl-32ec837ca7.json");
const User = require("./models/user");
const Ably = require("ably");

const realtime = new Ably.Realtime({
  key: "vrXrCA.OqwQXw:KQOb4-ZvefpMcDN-vfk1-meGK30RdJhkQGCsr1sjCmU",
});

const reminderChannel = realtime.channels.get("reminder");

setInterval(async () => {
  try {
    const users = await User.find({});
    for (const user of users) {
      for (const card of user.cards) {
        for (const item of card) {
          if (item.reminder && new Date(item.reminder) <= new Date()) {
            reminderChannel.publish("notify", {
              message: "It's time for a reminder!",
            });
            item.reminder = "";
          }
        }
      }
      await user.save();
    }
  } catch (error) {
    console.error("Error checking reminders:", error);
  }
}, 60 * 1000);

reminderChannel.subscribe("cardMovedToDone", (message) => {
  reminderChannel.publish("notify", {
    message: "Card moved to done!",
  });
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "https://nottrello-frontend.vercel.app",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Connection error", error);
  });

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.use("/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
