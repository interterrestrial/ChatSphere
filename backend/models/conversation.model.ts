import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    title: {
        type: String,
        default: null
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    }
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;
