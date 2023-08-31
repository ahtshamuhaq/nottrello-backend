const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const admin = require("firebase-admin");
const http = require("http");
const socketIo = require("socket.io");
const serviceAccount = require("./config/emailpasswordlogin-d7540-firebase-adminsdk-tlcpl-32ec837ca7.json");
const User = require("./models/user");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app); // Create the server using Express app
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Allow all origins (or specify your frontend domain)
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("cardMovedToDone", (data) => {
    console.log(`${data.email} moved a card to Done.`);
    // Here, you notify the admin
    socket.broadcast.emit("adminNotification", {
      message: `${data.email} moved a card to Done.`,
    });
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
setInterval(async () => {
  try {
    const users = await User.find({}); // fetch all users
    for (const user of users) {
      for (const card of user.cards) {
        for (const item of card) {
          if (item.reminder && new Date(item.reminder) <= new Date()) {
            io.emit("reminder", { message: "It's time for a reminder!" });
            item.reminder = ""; // clear the reminder to avoid sending it again
          }
        }
      }
      await user.save();
    }
  } catch (error) {
    console.error("Error checking reminders:", error);
  }
}, 60 * 1000); // Check every minute

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
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
