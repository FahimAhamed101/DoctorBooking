const mongoose = require('mongoose')
const { toJSON, paginate } = require("./plugins");

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Conversation'
    },
    text: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
    videoUrl: {
        type: String,
        default: ""
    },
    fileUrl: {
        type: String,
        default: ""
    },
    zoomJoinUrl: {
        type: String,
        default: ""
    },
    zoomHostStartUrl: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["text", "image", "video", "file", "link"],
        default: "text"
    },
    seen: {
        type: Boolean,
        default: false
    },
    msgByUserId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const conversationSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    appointmentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment',
        default: null
    },
    lastMessage: {
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
        default: null
    },
    messages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Message'
        }
    ],
    blockedBy: {
        type: mongoose.Schema.ObjectId,
        required: false,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    },
    blockStatus: {
        type: String,
        enum: ["blocked", "unblocked"],
        default: "unblocked"
    }
}, {
    timestamps: true
})

messageSchema.plugin(toJSON);
messageSchema.plugin(paginate);

conversationSchema.plugin(toJSON);
conversationSchema.plugin(paginate);

const MessageModel = mongoose.model('Message', messageSchema)
const ConversationModel = mongoose.model('Conversation', conversationSchema)

module.exports = {
    MessageModel,
    ConversationModel
}