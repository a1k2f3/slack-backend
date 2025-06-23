// import Message from '../models/Message.mjs';
import Chats from "../../schema/chat.js";
// Send a message from user to mechanic
import path from "path";
export const sendMessage = async (req, res) => {
  const { senderId,receiverId,message,role,location } = req.body;
  const image = req.file?.path.replace(/\\/g, "/"); // Normalize the path for cross-platform compatibility
  if (!senderId || !receiverId || !message || !role || !location) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  try {
    const newMessage = new Chats({
      senderId,
      receiverId,
      message,
      role,
      location,
      image,
    });
    await newMessage.save();
    const roomId = [senderId, receiverId].sort().join("-");
    req.io.to(`room-${roomId}`).emit('receive-message', {
      senderId,
      receiverId,
      message,
      location,
      image,
      timestamp: newMessage.createdAt,
    });
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
export const getChatHistory = async (req, res) => {
  const { userId, userId2, page = 1, limit = 20 } = req.query;
  if (!userId || !userId2) {  
    return res.status(400).json({ success: false, error: 'User IDs are required' });
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    const messages = await Chats.find({
      $or: [
        { senderId: userId, receiverId: userId2 },
        { senderId: userId2, receiverId: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Chats.countDocuments({
      $or: [
        { senderId: userId, receiverId: userId2 },
        { senderId: userId2, receiverId: userId }
      ]
    });

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error("❌ Error fetching chat history:", error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

