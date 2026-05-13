const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { User } = require("../models");
const {
  ConversationModel,
  MessageModel,
} = require("../models/conversation.model");
const { get, default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");

const userService = require("./user.service");

const createConversation = async (conversationData) => {
  const conversation = await ConversationModel.create(conversationData);

  const populatedConversation = await ConversationModel.findById(
    conversation._id
  )
    .populate("sender", "fullName role profileImage")
    .populate("receiver", "fullName role profileImage");

  return populatedConversation;
};

const getConversationByParticipants = async (participant1, participant2) => {
  const conversation = await ConversationModel.findOne({
    $or: [
      { sender: participant1, receiver: participant2 },
      { sender: participant2, receiver: participant1 },
    ],
  })
    .populate("sender", "fullName role profileImage")
    .populate("receiver", "fullName role profileImage")
    .populate("lastMessage")
    .exec();
  return conversation;
};

const getConversationById = async (id) => {
  try {
    return await ConversationModel.findById(id)
      .populate("sender", "fullName role profileImage")
      .populate("receiver", "fullName role profileImage");
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};
const updateConversation = async (id, body) => {
  const conversation = await getConversationById(id);

  if (conversation.blockStatus === "blocked") {
    if (body.blockStatus === "blocked") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This conversation is already blocked"
      );
    }

    if (conversation.blockedBy.toString() !== body.id) {
      throw new ApiError(httpStatus.BAD_REQUEST, "You can't unblock yourself");
    }
  }
  conversation.blockStatus = body.blockStatus;
  conversation.blockedBy = body.userId;
  await conversation.save();

  return conversation;
};

// const allConversationChartList = async (userId) => {
//   const conversations = await ConversationModel.find({
//     $or: [{ sender: userId }, { receiver: userId }],
//   }).sort({ updatedAt: -1 })
//     .populate('sender', 'fullName role profileImage')
//     .populate('receiver', 'fullName role profileImage')
//     .populate('lastMessage');

//   if (!conversations) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "No conversations found");
//   }

//   return conversations;
// };

const allConversationChartList = async (userId) => {
  const conversations = await ConversationModel.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .sort({ updatedAt: -1 })
    .populate("sender", "fullName role profileImage")
    .populate("receiver", "fullName role profileImage")
    .populate("lastMessage");

  if (!conversations || conversations.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No conversations found");
  }

  // Filter and return only the opposite user data
  const filteredConversations = conversations.map((conversation) => {
    const resiver =
      conversation.sender._id.toString() === userId.toString()
        ? conversation.receiver
        : conversation.sender;

    return {
      _id: conversation._id,
      resiver: {
        _id: resiver._id,
        fullName: resiver.fullName,
        role: resiver.role,
        profileImage: resiver.profileImage,
      },
      lastMessage: conversation.lastMessage,
      updatedAt: conversation.updatedAt,
    };
  });

  return filteredConversations;
};

const addMessage = async (messageData) => {
  const conversation = await getConversationById(messageData.conversationId);

  if (conversation.blockStatus === "blocked") {
    throw new ApiError(httpStatus.BAD_REQUEST, "This conversation is blocked");
  }

  // console.log("Message Data", messageData);
  const message = await MessageModel.create(messageData);

  await ConversationModel.findByIdAndUpdate(
    messageData.conversationId,
    {
      $push: { messages: message._id },
      $set: { lastMessage: message._id },
    },
    { new: true }
  );

  // return await MessageModel.findById(message._id).populate('sender', 'fullName image').populate('receiver', 'fullName image');
  return await MessageModel.findById(message._id);
};

const getMessages = async (conversationId, options) => {
  const { limit = 100, page = 1 } = options;

  const count = await MessageModel.countDocuments({
    conversationId: conversationId,
  });

  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  const messages = await MessageModel.find({
    conversationId: conversationId,
  })
    .populate({
      path: "msgByUserId",
      select: "fullName email profileImage",
    })
    .skip(skip)
    .limit(limit);
  // .sort({ createdAt: -1 });

  const result = {
    data: messages,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    totalResults: count,
  };

  return result;
};

const getMessageById = async (id) => {
  const message = await MessageModel.findById(id);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found");
  }
  return message;
};

const updateMessages = async (messageId, senderId, updateData) => {
  const message = await getMessageById(messageId);

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found");
  }

  if (message.msgByUserId.toString() !== senderId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this message"
    );
  }

  const updatedMessage = await MessageModel.findByIdAndUpdate(
    messageId,
    { $set: updateData },
    { new: true }
  );

  if (!updatedMessage) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update the message"
    );
  }

  return updatedMessage;
};

const getUserFormToken = async (token) => {
  if (!token) {
    return {
      message: "session out",
      logout: true,
    };
  }

  const decode = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decode.sub).select("-password");

  return user;
};

const getConversation = async (userId, currentUserId) => {
  if (
    !mongoose.Types.ObjectId.isValid(currentUserId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return [];
  }

  const conversations = await ConversationModel.find({
    $or: [{ sender: currentUserId }, { receiver: currentUserId }],
  })
    .sort({ updatedAt: -1 })
    .populate("messages")
    .populate("sender")
    .populate("receiver")
    .populate("appointmentId");

  // Filter out conversations where `userId` is either sender or receiver
  const unmatchedConversations = conversations.filter((conv) => {
    const senderId = conv?.sender?._id?.toString();
    const receiverId = conv?.receiver?._id?.toString();
    return senderId !== userId && receiverId !== userId;
  });

  // Map final data
  const result = unmatchedConversations.map((conv) => {
    const countUnseenMsg = conv?.messages?.reduce((prev, curr) => {
      const msgByUserId = curr?.msgByUserId?.toString();
      return msgByUserId !== currentUserId ? prev + (curr?.seen ? 0 : 1) : prev;
    }, 0);

    // Get the other user (not the currentUserId)
    const senderId = conv?.sender?._id?.toString();
    const receiverId = conv?.receiver?._id?.toString();
    const otherUser = senderId === currentUserId ? conv.receiver : conv.sender;

    return {
      id: conv?._id,
      title: conv?.title || "",
      user: otherUser, // only return the other participant
      appointment: conv?.appointmentId,
      status: conv?.status,
      blockStatus: conv?.blockStatus,
      unseenMsg: countUnseenMsg,
      lastMsg: conv.messages[conv?.messages?.length - 1],
    };
  });

  return result;
};


const makeConversation = async (sender, receiver, appointmentId, title) => {
  const superAdmin = await userService.getUserByRole("superAdmin");
  let conversation = await ConversationModel.findOne({
    $and: [
      {
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      },
      { appointmentId },
    ],
  });

  if (!conversation) {
    conversation = new ConversationModel({
      title: title || "",
      sender,
      receiver: superAdmin?._id,
      appointmentId,
    });
    conversation = await conversation.save();
  }

  return conversation;
};

const changeConversationStatus = async (conversationId, currentUserId) => {
  const conversation = await ConversationModel.findById(conversationId)
    .populate("messages")
    .populate("sender")
    .populate("receiver")
    .populate("appointmentId");

  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
  }

  // Change the conversation status
  conversation.status = conversation.status === "inactive" ? "active" : "inactive";

  // Save the updated conversation
  await conversation.save();

  // Get the count of unseen messages
  const countUnseenMsg = conversation?.messages?.reduce((prev, curr) => {
    const msgByUserId = curr?.msgByUserId?.toString();
    return msgByUserId !== currentUserId ? prev + (curr?.seen ? 0 : 1) : prev;
  }, 0);

  // Get the other user
  const senderId = conversation?.sender?._id?.toString();
  const receiverId = conversation?.receiver?._id?.toString();
  const otherUser = senderId === currentUserId ? conversation.receiver : conversation.sender;

  return {
    id: conversation?._id,
    title: conversation?.title || "",
    user: otherUser, // Only include the other participant
    appointment: conversation?.appointmentId,
    status: conversation?.status,
    blockStatus: conversation?.blockStatus,
    unseenMsg: countUnseenMsg,
    lastMsg: conversation.messages[conversation?.messages?.length - 1],
  };
};


module.exports = {
  createConversation,
  getConversationByParticipants,
  getConversationById,
  allConversationChartList,
  addMessage,
  getMessages,
  updateMessages,
  updateConversation,
  getUserFormToken,
  getConversation,
  makeConversation,
  changeConversationStatus
};
