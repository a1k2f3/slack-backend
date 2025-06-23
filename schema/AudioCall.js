import mongoose from 'mongoose';
import Accounts from "./user.js"; // Adjust the path as per your project structure
const audioCallSchema = new mongoose.Schema({
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
  filePath: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
export default mongoose.model('AudioCall', audioCallSchema);
