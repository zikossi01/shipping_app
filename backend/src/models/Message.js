const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'expéditeur du message est requis"],
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: [true, "La demande associée est requise"],
    },

    content: {
      type: String,
      required: [true, "Le contenu du message est requis"],
      maxlength: [2000, "Le message ne peut pas dépasser 2000 caractères"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "file", "location", "system"],
      default: "text",
    },

    // For images and files
    attachments: [
      {
        url: String,
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number, // in bytes
        thumbnailUrl: String, // for images
      },
    ],

    // For location sharing
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      accuracy: Number,
    },

    // Message status
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },

    // Read receipts
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // For system messages (status updates, etc.)
    systemData: {
      type: String, // JSON string for flexible system message data
      eventType: String, // 'status_update', 'request_accepted', etc.
    },

    // Message threading/replies
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // For message editing
    editHistory: [
      {
        content: String,
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },

    // For deleted messages
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Message metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
      platform: String, // 'web', 'mobile', 'api'
    },

    // For message reactions/emojis
    reactions: [
      {
        emoji: String,
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Priority for important messages
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // Automatic message expiration
    expiresAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
messageSchema.index({ request: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for conversation participants
messageSchema.virtual("isRead").get(function () {
  return this.readBy && this.readBy.length > 0;
});

// Virtual for message age
messageSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt;
});

// Pre-save middleware
messageSchema.pre("save", function (next) {
  // Update message status
  if (this.readBy && this.readBy.length > 0) {
    this.status = "read";
  }

  // Clean up deleted messages content
  if (this.isDeleted) {
    this.content = "[Message supprimé]";
    this.attachments = [];
    this.location = undefined;
  }

  next();
});

// Instance methods
messageSchema.methods.markAsRead = function (userId) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(
    (read) => read.user.toString() === userId.toString(),
  );

  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date(),
    });
    this.status = "read";
  }

  return this.save();
};

messageSchema.methods.addReaction = function (emoji, userId) {
  const existingReaction = this.reactions.find((r) => r.emoji === emoji);

  if (existingReaction) {
    // Check if user already reacted with this emoji
    if (!existingReaction.users.includes(userId)) {
      existingReaction.users.push(userId);
      existingReaction.count += 1;
    }
  } else {
    // Add new reaction
    this.reactions.push({
      emoji,
      users: [userId],
      count: 1,
    });
  }

  return this.save();
};

messageSchema.methods.removeReaction = function (emoji, userId) {
  const reaction = this.reactions.find((r) => r.emoji === emoji);

  if (reaction) {
    const userIndex = reaction.users.indexOf(userId);
    if (userIndex > -1) {
      reaction.users.splice(userIndex, 1);
      reaction.count -= 1;

      // Remove reaction if no users left
      if (reaction.count === 0) {
        this.reactions = this.reactions.filter((r) => r.emoji !== emoji);
      }
    }
  }

  return this.save();
};

messageSchema.methods.editMessage = function (newContent) {
  // Save to edit history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date(),
  });

  this.content = newContent;
  this.isEdited = true;

  return this.save();
};

messageSchema.methods.deleteMessage = function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.content = "[Message supprimé]";
  this.attachments = [];

  return this.save();
};

// Static methods
messageSchema.statics.getConversationMessages = function (
  requestId,
  page = 1,
  limit = 50,
) {
  const skip = (page - 1) * limit;

  return this.find({
    request: requestId,
    isDeleted: false,
  })
    .populate("sender", "firstName lastName avatar")
    .populate("replyTo", "content sender")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

messageSchema.statics.markConversationAsRead = function (requestId, userId) {
  return this.updateMany(
    {
      request: requestId,
      sender: { $ne: userId },
      "readBy.user": { $ne: userId },
    },
    {
      $push: {
        readBy: {
          user: userId,
          readAt: new Date(),
        },
      },
      $set: { status: "read" },
    },
  );
};

messageSchema.statics.getUnreadCount = function (requestId, userId) {
  return this.countDocuments({
    request: requestId,
    sender: { $ne: userId },
    "readBy.user": { $ne: userId },
    isDeleted: false,
  });
};

messageSchema.statics.searchMessages = function (requestId, query) {
  return this.find({
    request: requestId,
    content: { $regex: query, $options: "i" },
    isDeleted: false,
    type: "text",
  })
    .populate("sender", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .limit(20);
};

// Create system message helper
messageSchema.statics.createSystemMessage = function (
  requestId,
  eventType,
  data,
) {
  const systemMessages = {
    request_accepted: "La demande a été acceptée",
    request_rejected: "La demande a été refusée",
    pickup_scheduled: "Ramassage programmé",
    in_transit: "Colis en transit",
    delivered: "Colis livré avec succès",
    cancelled: "Transport annulé",
  };

  return this.create({
    request: requestId,
    sender: null, // System message
    content: systemMessages[eventType] || "Mise à jour du statut",
    type: "system",
    systemData: JSON.stringify(data),
    metadata: {
      platform: "system",
    },
  });
};

module.exports = mongoose.model("Message", messageSchema);
