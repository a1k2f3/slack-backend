import mongoose from "mongoose";
constgroupChatSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Groups', // Assuming you have a Groups model
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accounts', // Assuming you have an Accounts model
        required: true
    },
    message:{
        type: String,
        required: true
    },
    documents: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const GroupChat = mongoose.model('GroupChat', groupChatSchema);
export default GroupChat;