import mongoose from 'mongoose';
import Accounts from "./user.js"
const locationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Accounts, 
    required: true,  
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Location = mongoose.model('Location', locationSchema);
export default Location;
