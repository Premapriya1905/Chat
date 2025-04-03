const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://premapriya1905:gowri@cluster0.zecqypn.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define Schema & Model for storing messages
const chatSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

// Store active users
let activeUsers = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Add new user
  socket.on('new-user-add', (username) => {
    if (!activeUsers.some(user => user.username === username)) {
      activeUsers.push({
        username,
        socketId: socket.id
      });
    }
    io.emit('get-users', activeUsers);
  });

  // Send message and save to database
  socket.on('send-message', async (data) => {
    const { sender, receiver, message } = data;

    // Save message to MongoDB
    try {
      const newMessage = new Chat({ sender, receiver, message });
      await newMessage.save();
    } catch (error) {
      console.log("Error saving message:", error);
    }

    // Send message to receiver
    const user = activeUsers.find(user => user.username === receiver);
    if (user) {
      io.to(user.socketId).emit('receive-message', data);
    }
  });

  // Fetch chat history
  socket.on('get-messages', async ({ sender, receiver }) => {
    try {
      const messages = await Chat.find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      }).sort({ timestamp: 1 });

      socket.emit('messages-history', messages);
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    io.emit('get-users', activeUsers);
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 5173;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
