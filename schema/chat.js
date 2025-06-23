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
    role: { type: String,required: true }, //
    timestamp: { type: Date, default: Date.now },
   
    image: { type: String  ,default:null},
    documents: { type: String,default:null },
    video: { type: String,default:null },

  });
  const Chats = mongoose.model('chats', messageSchema);
export default Chats;
  