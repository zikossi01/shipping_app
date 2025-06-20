const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const { sendNotification } = require("../services/notificationService");

// Store active users and their socket connections
const activeUsers = new Map();

// Middleware to authenticate socket connections
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token d'authentification requis"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("Utilisateur non trouvé"));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Token invalide"));
  }
};

const setupSocket = (io) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(
      `✅ User ${socket.user.firstName} ${socket.user.lastName} connected: ${socket.id}`,
    );

    // Store user connection
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date(),
    });

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Emit online status to relevant contacts
    socket.broadcast.emit("user_online", {
      userId: socket.userId,
      user: {
        id: socket.user._id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        avatar: socket.user.avatar,
      },
    });

    // Handle joining conversation rooms
    socket.on("join_conversation", async (data) => {
      try {
        const { conversationId, requestId } = data;

        // Verify user has access to this conversation
        const request = await Request.findById(requestId)
          .populate("trip", "driver")
          .populate("shipper");

        if (!request) {
          socket.emit("error", { message: "Demande non trouvée" });
          return;
        }

        // Check if user is part of this conversation
        const isDriver = request.trip.driver.toString() === socket.userId;
        const isShipper = request.shipper._id.toString() === socket.userId;

        if (!isDriver && !isShipper) {
          socket.emit("error", {
            message: "Accès non autorisé à cette conversation",
          });
          return;
        }

        socket.join(conversationId);

        // Load recent messages
        const messages = await Message.find({
          request: requestId,
        })
          .populate("sender", "firstName lastName avatar")
          .sort({ createdAt: -1 })
          .limit(50);

        socket.emit("conversation_joined", {
          conversationId,
          messages: messages.reverse(),
        });

        console.log(
          `📱 User ${socket.userId} joined conversation ${conversationId}`,
        );
      } catch (error) {
        console.error("Join conversation error:", error);
        socket.emit("error", {
          message: "Erreur lors de la connexion à la conversation",
        });
      }
    });

    // Handle leaving conversation rooms
    socket.on("leave_conversation", (data) => {
      const { conversationId } = data;
      socket.leave(conversationId);
      console.log(
        `📱 User ${socket.userId} left conversation ${conversationId}`,
      );
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { requestId, content, type = "text" } = data;

        if (!content || !requestId) {
          socket.emit("error", { message: "Contenu et ID de demande requis" });
          return;
        }

        // Verify request exists and user has access
        const request = await Request.findById(requestId)
          .populate("trip", "driver")
          .populate("shipper", "firstName lastName avatar");

        if (!request) {
          socket.emit("error", { message: "Demande non trouvée" });
          return;
        }

        const isDriver = request.trip.driver.toString() === socket.userId;
        const isShipper = request.shipper._id.toString() === socket.userId;

        if (!isDriver && !isShipper) {
          socket.emit("error", {
            message:
              "Non autorisé à envoyer des messages dans cette conversation",
          });
          return;
        }

        // Create message
        const message = await Message.create({
          sender: socket.userId,
          request: requestId,
          content,
          type,
          timestamp: new Date(),
        });

        // Populate sender info
        await message.populate("sender", "firstName lastName avatar");

        // Update request's last message timestamp
        request.lastMessageAt = new Date();
        await request.save();

        const conversationId = `request_${requestId}`;

        // Emit message to all users in the conversation
        io.to(conversationId).emit("new_message", {
          message,
          conversationId,
          requestId,
        });

        // Send notification to the other party
        const recipientId = isDriver
          ? request.shipper._id
          : request.trip.driver;
        const recipientUser = activeUsers.get(recipientId.toString());

        if (recipientUser) {
          // User is online, send real-time notification
          io.to(`user_${recipientId}`).emit("new_message_notification", {
            message,
            sender: socket.user,
            requestId,
            conversationId,
          });
        }

        // Send push notification if user is offline or has notifications enabled
        await sendNotification({
          userId: recipientId,
          type: "new_message",
          title: "Nouveau message",
          message: `${socket.user.firstName} vous a envoyé un message`,
          data: {
            requestId,
            conversationId,
            senderId: socket.userId,
          },
        });

        console.log(
          `💬 Message sent in conversation ${conversationId} by ${socket.userId}`,
        );
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Erreur lors de l'envoi du message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      const { conversationId, requestId } = data;
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
        user: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
        },
        conversationId,
        requestId,
      });
    });

    socket.on("typing_stop", (data) => {
      const { conversationId, requestId } = data;
      socket.to(conversationId).emit("user_stop_typing", {
        userId: socket.userId,
        conversationId,
        requestId,
      });
    });

    // Handle message read receipts
    socket.on("mark_messages_read", async (data) => {
      try {
        const { requestId, messageIds } = data;

        // Update message read status
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            sender: { $ne: socket.userId },
          },
          {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date(),
              },
            },
          },
        );

        // Notify other users in conversation that messages were read
        const conversationId = `request_${requestId}`;
        socket.to(conversationId).emit("messages_read", {
          readBy: socket.userId,
          messageIds,
          readAt: new Date(),
        });
      } catch (error) {
        console.error("Mark messages read error:", error);
      }
    });

    // Handle request status updates
    socket.on("request_status_update", async (data) => {
      try {
        const { requestId, status, note } = data;

        const request = await Request.findById(requestId)
          .populate("trip", "driver")
          .populate("shipper");

        if (!request) {
          socket.emit("error", { message: "Demande non trouvée" });
          return;
        }

        // Check authorization
        const isDriver = request.trip.driver.toString() === socket.userId;
        const isShipper = request.shipper._id.toString() === socket.userId;

        if (!isDriver && !isShipper) {
          socket.emit("error", { message: "Non autorisé" });
          return;
        }

        // Update request status
        await request.updateStatus(status, socket.userId, note);

        const conversationId = `request_${requestId}`;

        // Notify all users in conversation
        io.to(conversationId).emit("request_status_updated", {
          requestId,
          status,
          note,
          updatedBy: socket.user,
          timestamp: new Date(),
        });

        // Send notification to the other party
        const otherUserId = isDriver
          ? request.shipper._id
          : request.trip.driver;
        await sendNotification({
          userId: otherUserId,
          type: "request_status_update",
          title: "Mise à jour de votre demande",
          message: `Le statut de votre demande a été mis à jour: ${status}`,
          data: { requestId, status },
        });
      } catch (error) {
        console.error("Request status update error:", error);
        socket.emit("error", {
          message: "Erreur lors de la mise à jour du statut",
        });
      }
    });

    // Handle location sharing
    socket.on("share_location", (data) => {
      const { conversationId, requestId, location } = data;

      socket.to(conversationId).emit("location_shared", {
        userId: socket.userId,
        user: socket.user,
        location,
        timestamp: new Date(),
        requestId,
      });
    });

    // Handle user disconnect
    socket.on("disconnect", (reason) => {
      console.log(`❌ User ${socket.userId} disconnected: ${reason}`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Emit offline status
      socket.broadcast.emit("user_offline", {
        userId: socket.userId,
        lastSeen: new Date(),
      });
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const now = new Date();
    for (const [userId, userData] of activeUsers.entries()) {
      if (now - userData.lastSeen > 5 * 60 * 1000) {
        // 5 minutes
        activeUsers.delete(userId);
        io.emit("user_offline", { userId, lastSeen: userData.lastSeen });
      }
    }
  }, 60000); // Check every minute

  console.log("🔌 Socket.IO configured for real-time communication");
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(activeUsers.entries()).map(([userId, userData]) => ({
    userId,
    user: userData.user,
    lastSeen: userData.lastSeen,
  }));
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return activeUsers.has(userId.toString());
};

// Helper function to send real-time notification to user
const sendRealtimeNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit("notification", notification);
};

module.exports = {
  setupSocket,
  getOnlineUsers,
  isUserOnline,
  sendRealtimeNotification,
};
