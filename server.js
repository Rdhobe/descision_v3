const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Configure Socket.io with better error handling and CORS
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true
    },
    pingTimeout: 30000,
    pingInterval: 25000,
    connectTimeout: 10000
  });

  // Handle Socket.io connections
  io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] New client connected: ${socket.id}`);

    // Join a chat room
    socket.on('join-chat', (chatId) => {
      if (!chatId) {
        console.error(`[${new Date().toISOString()}] Invalid chatId: ${chatId}`);
        return;
      }
      
      socket.join(chatId);
      console.log(`[${new Date().toISOString()}] Socket ${socket.id} joined room ${chatId}`);
    });

    // Listen for new messages
    socket.on('send-message', (data) => {
      if (!data || !data.chatId) {
        console.error(`[${new Date().toISOString()}] Invalid message data`, data);
        return;
      }
      
      // Broadcast to everyone in the room except sender
      socket.to(data.chatId).emit('receive-message', data.message);
      console.log(`[${new Date().toISOString()}] Message sent to room ${data.chatId}`);
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
      if (!data || !data.chatId || !data.userId) {
        console.error(`[${new Date().toISOString()}] Invalid typing data`, data);
        return;
      }
      
      socket.to(data.chatId).emit('user-typing', { 
        userId: data.userId,
        isTyping: true 
      });
    });

    socket.on('typing-stop', (data) => {
      if (!data || !data.chatId || !data.userId) {
        console.error(`[${new Date().toISOString()}] Invalid typing data`, data);
        return;
      }
      
      socket.to(data.chatId).emit('user-typing', { 
        userId: data.userId,
        isTyping: false 
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] Socket ${socket.id} error:`, error);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  // Log server errors
  io.engine.on('connection_error', (err) => {
    console.error(`[${new Date().toISOString()}] Connection error:`, err);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Server error:`, err);
      throw err;
    }
    console.log(`[${new Date().toISOString()}] > Server ready on http://localhost:${PORT}`);
  });
}); 