const onlineUsers = new Map();
export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    // Register user after login
    socket.on("register-user", (user) => {
      onlineUsers.set(socket.id, user);
      console.log("✅ Registered user:", user);
    });
    // User comes online
    socket.on("user-online", ({ id, email }) => {
      onlineUsers.set(socket.id, { id, email });
      socket.broadcast.emit("user-status", { id, status: "online" });
    });
    // User follows another
    socket.on("follow-user", (targetUserId) => {
      socket.join(`follow-${targetUserId}`);
      console.log(`📡 ${socket.id} joined follow-${targetUserId}`);
    });

    // Share location
    socket.on("send-location", ({ id, latitude, longitude }) => {
      socket.broadcast.emit("location-update", { id, latitude, longitude });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit("user-status", { id: user.id, status: "offline" });
      }
      onlineUsers.delete(socket.id);
      console.log("❌ Disconnected:", socket.id);
    });
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a private room based on userId and mechanicId
  socket.on('join-room', ({ userId, mechanicId }) => {
    const room = `room-${userId}-${mechanicId}`;
    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
  });

  // Listen for messages and broadcast them to the correct room
  socket.on('chat-message', ({ senderId, receiverId, message }) => {
    const room = `room-${senderId}-${receiverId}`;
    io.to(room).emit('receive-message', { senderId, message });
    console.log(`Message sent to room ${room}: ${message}`);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
console.log('A user connected:', socket.id);
  
    // Join a private room based on userId and mechanicId
    socket.on('join-room', ({ userId, mechanicId }) => {
      const room = `room-${userId}-${mechanicId}`;
      socket.join(room);
      console.log(`${socket.id} joined room ${room}`);
    });
  
    // Listen for messages and broadcast them to the correct room
    socket.on('chat-message', ({ senderId, receiverId, message }) => {
      const room = `room-${senderId}-${receiverId}`;
      io.to(room).emit('receive-message', { senderId, message });
      console.log(`Message sent to room ${room}: ${message}`);
    });
    socket.on("call-user", ({ to, offer }) => {
      socket.to(to).emit("incoming-call", { from: socket.id, offer });
    });
    
    socket.on("answer-call", ({ to, answer }) => {
      socket.to(to).emit("call-answered", { from: socket.id, answer });
    });
    
    socket.on("ice-candidate", ({ to, candidate }) => {
      socket.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });
    
    // Disconnect event
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  })
}
export { onlineUsers };