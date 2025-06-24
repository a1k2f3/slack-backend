// import Message from '../models/Message.mjs';

// import { group } from "console";
import Group from "../../schema/goup";
import GroupChat from "../../schema/groupchat";
// Send a message from user to mechanic
import path from "path";
export const sendMessage = async (req, res) => {
  const {groupid,senderId,message} = req.body;
  if (!groupid||!senderId  || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  try {
    const newMessage = new GroupChat({
      groupid,
      senderId,
      message,
      documents: req.file ? req.file.path.replace(/\\/g, "/") : null, // Normalize the path for cross-platform compatibility
    });
    await newMessage.save();
    
    req.io.to(`room-${groupid}`).emit('receive-message', {
      senderId,
      groupid,
      message,
      documents: newMessage.documents, // Use the saved document path
      timestamp: newMessage.createdAt,
    });
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
export const createGroup = async (req, res) => {
  const { groupname, description, members, createdby, role } = req.body;
  const groupimage = req.file?.path.replace(/\\/g, "/");

  if (!groupname || !role || !createdby || !members) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const newGroup = new Group({
      groupname,
      description,
      members,
      groupimage,
      createdby,
      role
    });

    await newGroup.save();

    res.status(201).json({ success: true, data: newGroup });
  } catch (error) {
    console.error("❌ Error creating group:", error.message);
    res.status(500).json({ success: false, error: 'Failed to create group' });
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

