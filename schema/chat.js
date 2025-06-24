import mongoose from 'mongoose';
import Accounts from "./user.js"; // Adjust the path as per your project structure
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Accounts, 
        required: true,  
      },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Accounts, 
        required: true,  
      },
    message: String,
  
    timestamp: { type: Date, default: Date.now },
     documents: { type: String,default:null },

  });
  const Chats = mongoose.model('chats', messageSchema);
export default Chats;
  