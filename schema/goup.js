import mongoose from "mongoose";
const groupschema= new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupImage: {
        type: String,
        default: null
    },
    groupDescription: {
        type: String,
        default: null
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accounts'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accounts',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Group = mongoose.model('Group', groupschema);
export default Group;