const { default: mongoose } = require("mongoose");
const logger = require("../config/logger");
const { User } = require("../models");
const { ConversationModel, MessageModel } = require("../models/conversation.model");
const { getUserFormToken, getConversation } = require("../services/conversation.service");
const agoraService  = require("../services/agora.service");
// Track connected users
const connectedUsers = new Map();

const socketIO = (io) => {
  io.on("connection", async (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    let user = null;

    // Authenticate user
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.error("No token provided for authentication");
      socket.emit("error", { message: "Authentication failed: No token provided" });
      socket.disconnect(true);
      return;
    }

    try {
      user = await getUserFormToken(token);
      if (!user) {
        logger.error("Authentication failed: Invalid token");
        socket.emit("error", { message: "Authentication failed: Invalid token" });
        socket.disconnect(true);
        return;
      }

      // Add user to connected users map
      const userId = user._id.toString();
      connectedUsers.set(userId, {
        socketId: socket.id,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });

      socket.userId = userId;
      socket.join(userId);

      logger.info(`User ${user.fullName} (${userId}) connected`);

      // Notify others about this user's online status
      socket.broadcast.emit("user-status", {
        userId,
        online: true
      });

    } catch (error) {
      logger.error("Authentication error:", error);
      socket.emit("error", { message: "Authentication failed: Invalid token" });
      socket.disconnect(true);
      return;
    }

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);

      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        socket.broadcast.emit("user-status", {
          userId: socket.userId,
          online: false
        });
      }
    });

    // Message Page Handler - FIXED to handle inactive conversations
    socket.on("message-page", async (data, callback) => {
      try {
        logger.info(`Message page request from user ${user._id}`);

        // Validate input
        if (!data || typeof data !== 'object') {
          const errorMsg = "Invalid request data";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        const { receiver, appointmentId } = data;

        if (!receiver) {
          const errorMsg = "Receiver ID is required";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(receiver)) {
          const errorMsg = "Invalid receiver ID format";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Validate appointmentId if provided
        if (appointmentId && !mongoose.Types.ObjectId.isValid(appointmentId)) {
          const errorMsg = "Invalid appointment ID format";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Find receiver user
        const receiverUser = await User.findById(receiver).select("-password");
        if (!receiverUser) {
          const errorMsg = "Receiver not found";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Check if receiver is online
        const isOnline = connectedUsers.has(receiver);

        const userPayload = {
          _id: receiverUser._id,
          fullName: receiverUser.fullName,
          email: receiverUser.email,
          profileImage: receiverUser.profileImage,
          online: isOnline,
        };

        socket.emit("message-user", userPayload);

        // Build conversation query - FIXED: Ensure proper ObjectId conversion
        const senderId = new mongoose.Types.ObjectId(user._id);
        const receiverId = new mongoose.Types.ObjectId(receiver);

        const conversationQuery = {
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
          ]
        };

        // Add appointment filter if provided
        if (appointmentId) {
          conversationQuery.appointmentId = new mongoose.Types.ObjectId(appointmentId);
        } else {
          conversationQuery.appointmentId = null;
        }

        logger.info(`Searching for conversation with query:`, JSON.stringify(conversationQuery));

        // Get conversation with populated data - REMOVED status filter to include inactive conversations
        const conversation = await ConversationModel.findOne(conversationQuery)
          .populate("sender", "fullName profileImage email")
          .populate("receiver", "fullName profileImage email")
          .populate("appointmentId")
          .populate({
            path: 'messages',
            options: { sort: { createdAt: 1 } }
          })
          .lean();

        if (conversation) {
          // FIXED: Always return conversation data regardless of status
          const conversationData = {
            _id: conversation._id,
            sender: conversation.sender,
            receiver: conversation.receiver,
            appointmentId: conversation.appointmentId?._id || null,
            appointment: conversation.appointmentId || null,
            status: conversation.status, // Include status in response
            messages: conversation.messages || [],
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
          };

          socket.emit("conversation-data", conversationData);
          socket.emit("message", conversation.messages || []);

          logger.info(`Conversation loaded: ${conversation._id} with status: ${conversation.status}`);

          // FIXED: Emit status information to client
          socket.emit("conversation-status", {
            conversationId: conversation._id,
            status: conversation.status,
            canSendMessage: conversation.status === 'active' || user.role !== 'user'
          });
        } else {
          // Create placeholder conversation data
          const placeholderData = {
            _id: null,
            sender: {
              _id: user._id,
              fullName: user.fullName,
              profileImage: user.profileImage,
              email: user.email
            },
            receiver: {
              _id: receiverUser._id,
              fullName: receiverUser.fullName,
              profileImage: receiverUser.profileImage,
              email: receiverUser.email
            },
            appointmentId: appointmentId || null,
            appointment: null,
            status: 'active',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          socket.emit("conversation-data", placeholderData);
          socket.emit("message", []);

          logger.info(`No conversation found, sent placeholder data`);
        }

        if (callback) callback({ success: true });
      } catch (error) {
        logger.error("Error in message-page handler:", error);
        const errorMsg = "Failed to load messages";
        if (callback) callback({ success: false, error: { message: errorMsg } });
        socket.emit("error", { message: errorMsg });
      }
    });

    // New Message Handler - FIXED to better handle inactive conversations
    socket.on("new-message", async (data, callback) => {
      try {
        logger.info(`New message from user ${user._id}`);

        // Validate input
        if (!data || typeof data !== 'object') {
          const errorMsg = "Invalid message data";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        const {
          sender,
          receiver,
          appointmentId,
          type,
          text,
          imageUrl,
          videoUrl,
          consultationLink,
          msgByUserId,
          tempId
        } = data;

        // Validation
        if (!sender || !receiver || !type || !msgByUserId) {
          const errorMsg = "Required fields missing: sender, receiver, type, msgByUserId";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(sender) ||
          !mongoose.Types.ObjectId.isValid(receiver) ||
          !mongoose.Types.ObjectId.isValid(msgByUserId)) {
          const errorMsg = "Invalid ID format";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Validate appointmentId if provided
        if (appointmentId && !mongoose.Types.ObjectId.isValid(appointmentId)) {
          const errorMsg = "Invalid appointment ID format";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Validate message type and content
        const validTypes = ['text', 'image', 'video', 'link', 'consultation'];
        if (!validTypes.includes(type)) {
          const errorMsg = "Invalid message type";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Check if user is authorized to send this message
        if (msgByUserId !== user._id.toString()) {
          const errorMsg = "Unauthorized message sender";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Build conversation query
        const conversationQuery = {
          $or: [
            { sender: new mongoose.Types.ObjectId(sender), receiver: new mongoose.Types.ObjectId(receiver) },
            { sender: new mongoose.Types.ObjectId(receiver), receiver: new mongoose.Types.ObjectId(sender) },
          ]
        };

        if (appointmentId) {
          conversationQuery.appointmentId = new mongoose.Types.ObjectId(appointmentId);
        } else {
          conversationQuery.appointmentId = null;
        }

        // Find or create conversation
        let conversation = await ConversationModel.findOne(conversationQuery);

        if (!conversation) {
          conversation = new ConversationModel({
            sender: new mongoose.Types.ObjectId(sender),
            receiver: new mongoose.Types.ObjectId(receiver),
            appointmentId: appointmentId ? new mongoose.Types.ObjectId(appointmentId) : null,
            messages: [],
            status: "active",
          });
          await conversation.save();
          logger.info(`New conversation created: ${conversation._id}`);
        }

        // FIXED: Better permission check for sending messages in inactive conversations
        if (conversation.status === "inactive") {
          if (user.role === "user") {
            const errorMsg = "Cannot send messages in inactive conversation";
            logger.error(errorMsg);
            if (callback) callback({ success: false, error: { message: errorMsg } });
            return;
          } else {
            // Admin/Doctor can send messages in inactive conversations
            // Optionally reactivate the conversation
            conversation.status = "active";
            await conversation.save();
            logger.info(`Conversation reactivated by ${user.role}: ${conversation._id}`);
          }
        }

        // Create message based on type
        let messageData = {
          msgByUserId: new mongoose.Types.ObjectId(msgByUserId),
          type,
          conversationId: conversation._id,
        };

        if (type === "link") {
          if (!appointmentId) {
            const errorMsg = "Appointment ID required for link messages";
            logger.error(errorMsg);
            if (callback) callback({ success: false, error: { message: errorMsg } });
            return;
          }
          /*
          try {
            const zoomMeetingLink = await zoomService.generateZoomMeeting(appointmentId);
            messageData.zoomJoinUrl = zoomMeetingLink.joinUrl;
            messageData.zoomHostStartUrl = zoomMeetingLink.startUrl;
          } catch (zoomError) {
            logger.error("Zoom meeting generation failed:", zoomError);
            const errorMsg = "Failed to generate meeting link";
            if (callback) callback({ success: false, error: { message: errorMsg } });
            return;
          }
*/
          try {
            const agoraMeetingLink = await agoraService.generateAgoraMeeting(appointmentId);
            console.log("Agora meeting link generated:", agoraMeetingLink);
            messageData.zoomJoinUrl = JSON.stringify(agoraMeetingLink);
            messageData.zoomHostStartUrl = agoraMeetingLink.startUrl;
          } catch (zoomError) {
            logger.error("Zoom meeting generation failed:", zoomError);
            const errorMsg = "Failed to generate meeting link";
            if (callback) callback({ success: false, error: { message: errorMsg } });
            return;
          }

        } else {
          // Add content based on message type
          if (text) messageData.text = text;
          if (imageUrl) messageData.imageUrl = imageUrl;
          if (videoUrl) messageData.videoUrl = videoUrl;
          if (consultationLink) messageData.consultationLink = consultationLink;
        }

        const message = new MessageModel(messageData);
        const savedMessage = await message.save();

        // Update conversation with new message
        await ConversationModel.findByIdAndUpdate(
          conversation._id,
          {
            $push: { messages: savedMessage._id },
            $set: { updatedAt: new Date() },
          }
        );

        // Get updated conversation with populated data
        const updatedConversation = await ConversationModel.findById(conversation._id)
          .populate({
            path: 'messages',
            options: { sort: { createdAt: 1 } }
          })
          .populate('sender', 'fullName profileImage email')
          .populate('receiver', 'fullName profileImage email')
          .populate('appointmentId')
          .lean();

        // Emit messages to both users
        const messagesToEmit = updatedConversation?.messages || [];
        io.to(sender).emit("message", messagesToEmit);
        io.to(receiver).emit("message", messagesToEmit);

        // Update conversation lists for both users
        await updateConversationLists(io, sender, receiver);

        logger.info(`Message sent successfully: ${savedMessage._id}`);

        if (callback) callback({
          success: true,
          message: savedMessage,
          tempId // Return tempId for client-side mapping
        });
      } catch (error) {
        logger.error("Error in new-message handler:", error);
        const errorMsg = "Failed to send message";
        if (callback) callback({ success: false, error: { message: errorMsg } });
        socket.emit("error", { message: errorMsg });
      }
    });

    // Conversation Page Handler - FIXED to include inactive conversations
    socket.on("conversation-page", async (data, callback) => {
      try {
        logger.info(`Conversation page request from user ${user._id}`);

        const { currentUserId } = data || {};
        const userId = currentUserId || user._id.toString();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          const errorMsg = "Invalid user ID";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Get user's conversations - REMOVED status filter to include inactive conversations
        const conversations = await ConversationModel.find({
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
          // No status filter here - include all conversations
        })
          .populate("sender", "fullName profileImage email")
          .populate("receiver", "fullName profileImage email")
          .populate("appointmentId")
          .populate({
            path: 'messages',
            options: { sort: { createdAt: -1 }, limit: 1 } // Get only the last message
          })
          .sort({ updatedAt: -1 })
          .lean();

        // Format conversations with additional data
        const formattedConversations = conversations.map((conv) => {
          const otherUserId = conv.sender._id.toString() === userId
            ? conv.receiver._id.toString()
            : conv.sender._id.toString();

          const isOnline = connectedUsers.has(otherUserId);

          return {
            ...conv,
            appointment: conv.appointmentId || null,
            lastMsg: conv.messages && conv.messages.length > 0 ? conv.messages[0] : null,
            unseenMsg: 0, // This should be calculated based on actual seen status
            otherUserOnline: isOnline,
            otherUser: conv.sender._id.toString() === userId ? conv.receiver : conv.sender,
            // FIXED: Include status and permission information
            status: conv.status,
            canSendMessage: conv.status === 'active' || user.role !== 'user'
          };
        });

        socket.emit("conversation", formattedConversations);

        logger.info(`Sent ${formattedConversations.length} conversations to user ${userId}`);

        if (callback) callback({ success: true });
      } catch (error) {
        logger.error("Error in conversation-page handler:", error);
        const errorMsg = "Failed to load conversations";
        if (callback) callback({ success: false, error: { message: errorMsg } });
        socket.emit("error", { message: errorMsg });
      }
    });

    // Status Update Handler
    socket.on("status", async (data, callback) => {
      try {
        logger.info(`Status update request from user ${user._id}`);

        // Check permissions
        if (user.role === "user") {
          const errorMsg = "Insufficient permissions to change conversation status";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        const { conversationId } = data || {};

        if (!conversationId) {
          const errorMsg = "Conversation ID is required";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          const errorMsg = "Invalid conversation ID";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Find conversation
        const existingConversation = await ConversationModel.findById(conversationId)
          .populate('sender', '_id fullName')
          .populate('receiver', '_id fullName')
          .populate('appointmentId')
          .lean();

        if (!existingConversation) {
          const errorMsg = "Conversation not found";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Toggle status
        const newStatus = existingConversation.status === "active" ? "inactive" : "active";

        // Update conversation
        const updatedConversation = await ConversationModel.findByIdAndUpdate(
          conversationId,
          {
            $set: {
              status: newStatus,
              updatedAt: new Date()
            }
          },
          { new: true }
        )
          .populate("sender", "fullName profileImage email")
          .populate("receiver", "fullName profileImage email")
          .populate("appointmentId")
          .populate({
            path: 'messages',
            options: { sort: { createdAt: -1 }, limit: 1 }
          })
          .lean();

        if (!updatedConversation) {
          const errorMsg = "Failed to update conversation status";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Emit status change to both participants
        const senderSocketId = connectedUsers.get(existingConversation.sender._id.toString())?.socketId;
        const receiverSocketId = connectedUsers.get(existingConversation.receiver._id.toString())?.socketId;

        const statusChangeData = {
          conversationId,
          status: newStatus,
          updatedAt: updatedConversation.updatedAt,
          canSendMessage: newStatus === 'active' || user.role !== 'user'
        };

        if (senderSocketId) {
          io.to(senderSocketId).emit("conversation-status", statusChangeData);
        }
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("conversation-status", statusChangeData);
        }

        // Update conversation lists
        await updateConversationLists(
          io,
          existingConversation.sender._id.toString(),
          existingConversation.receiver._id.toString()
        );

        logger.info(`Conversation status updated: ${conversationId} -> ${newStatus}`);

        if (callback) callback({
          success: true,
          conversation: {
            ...updatedConversation,
            appointment: updatedConversation.appointmentId,
            lastMsg: updatedConversation.messages?.[0] || null,
            canSendMessage: newStatus === 'active' || user.role !== 'user'
          },
          status: newStatus
        });
      } catch (error) {
        logger.error("Error in status handler:", error);
        const errorMsg = `Failed to update conversation status: ${error.message}`;
        if (callback) callback({ success: false, error: { message: errorMsg } });
        socket.emit("error", { message: errorMsg });
      }
    });

    // Message seen handler
    socket.on("mark-seen", async (data, callback) => {
      try {
        const { conversationId, messageIds } = data || {};

        if (!conversationId || !messageIds || !Array.isArray(messageIds)) {
          const errorMsg = "Invalid data for mark-seen";
          logger.error(errorMsg);
          if (callback) callback({ success: false, error: { message: errorMsg } });
          return;
        }

        // Update messages as seen
        await MessageModel.updateMany(
          {
            _id: { $in: messageIds },
            conversationId: new mongoose.Types.ObjectId(conversationId),
            msgByUserId: { $ne: user._id }
          },
          { $set: { seen: true, seenAt: new Date() } }
        );

        logger.info(`Marked ${messageIds.length} messages as seen in conversation ${conversationId}`);

        if (callback) callback({ success: true });
      } catch (error) {
        logger.error("Error in mark-seen handler:", error);
        if (callback) callback({ success: false, error: { message: error.message } });
      }
    });
  });

  // Helper function to update conversation lists - FIXED to include inactive conversations
  async function updateConversationLists(io, senderId, receiverId) {
    try {
      const updateUserConversations = async (userId) => {
        const conversations = await ConversationModel.find({
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
          // No status filter - include all conversations
        })
          .populate('sender', 'fullName profileImage email')
          .populate('receiver', 'fullName profileImage email')
          .populate('appointmentId')
          .populate({
            path: 'messages',
            options: { sort: { createdAt: -1 }, limit: 1 }
          })
          .sort({ updatedAt: -1 })
          .lean();

        const formattedConversations = conversations.map(conv => {
          const otherUserId = conv.sender._id.toString() === userId
            ? conv.receiver._id.toString()
            : conv.sender._id.toString();

          const isOnline = connectedUsers.has(otherUserId);

          return {
            ...conv,
            appointment: conv.appointmentId,
            lastMsg: conv.messages?.[0] || null,
            unseenMsg: 0, // Should be calculated based on actual seen status
            otherUserOnline: isOnline,
            otherUser: conv.sender._id.toString() === userId ? conv.receiver : conv.sender,
            status: conv.status,
            canSendMessage: conv.status === 'active' || (connectedUsers.get(userId)?.user?.role !== 'user')
          };
        });

        const userConnection = connectedUsers.get(userId);
        if (userConnection?.socketId) {
          io.to(userConnection.socketId).emit("conversation", formattedConversations);
        }
      };

      await Promise.all([
        updateUserConversations(senderId),
        updateUserConversations(receiverId)
      ]);
    } catch (error) {
      logger.error("Error updating conversation lists:", error);
    }
  }
};

module.exports = socketIO;
