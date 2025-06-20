const User = require("../models/User");
const { sendEmail } = require("./emailService");

// In-memory notification store (use Redis in production)
const notificationStore = new Map();

// Notification types
const NOTIFICATION_TYPES = {
  NEW_MESSAGE: "new_message",
  REQUEST_ACCEPTED: "request_accepted",
  REQUEST_REJECTED: "request_rejected",
  REQUEST_STATUS_UPDATE: "request_status_update",
  TRIP_STARTED: "trip_started",
  PICKUP_SCHEDULED: "pickup_scheduled",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  PAYMENT_RECEIVED: "payment_received",
  REVIEW_RECEIVED: "review_received",
  ACCOUNT_VERIFIED: "account_verified",
  ACCOUNT_SUSPENDED: "account_suspended",
  SYSTEM_ANNOUNCEMENT: "system_announcement",
};

// Create notification
const createNotification = async (notification) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data = {},
      priority = "normal",
      expiresAt,
    } = notification;

    const notificationData = {
      id: generateNotificationId(),
      userId,
      type,
      title,
      message,
      data,
      priority,
      isRead: false,
      createdAt: new Date(),
      expiresAt: expiresAt || null,
    };

    // Store notification (use database in production)
    if (!notificationStore.has(userId.toString())) {
      notificationStore.set(userId.toString(), []);
    }

    const userNotifications = notificationStore.get(userId.toString());
    userNotifications.unshift(notificationData);

    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    // Log notification creation
    console.log(`📢 Notification created for user ${userId}: ${title}`);

    return notificationData;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

// Send notification (main function)
const sendNotification = async (notification) => {
  try {
    const { userId, type, title, message, data = {} } = notification;

    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    // Create notification record
    const notificationRecord = await createNotification(notification);

    // Send via different channels based on user preferences
    const results = {};

    // Email notification
    if (user.preferences?.notifications?.email) {
      try {
        results.email = await sendEmailNotification(user, {
          type,
          title,
          message,
          data,
        });
      } catch (error) {
        console.error("Email notification failed:", error);
        results.email = { success: false, error: error.message };
      }
    }

    // Push notification (if enabled)
    if (user.preferences?.notifications?.push) {
      try {
        results.push = await sendPushNotification(user, {
          type,
          title,
          message,
          data,
        });
      } catch (error) {
        console.error("Push notification failed:", error);
        results.push = { success: false, error: error.message };
      }
    }

    // SMS notification (if enabled and urgent)
    if (
      user.preferences?.notifications?.sms &&
      (notification.priority === "urgent" || notification.priority === "high")
    ) {
      try {
        results.sms = await sendSMSNotification(user, {
          title,
          message,
        });
      } catch (error) {
        console.error("SMS notification failed:", error);
        results.sms = { success: false, error: error.message };
      }
    }

    return {
      notificationId: notificationRecord.id,
      channels: results,
    };
  } catch (error) {
    console.error("Send notification error:", error);
    return false;
  }
};

// Send email notification
const sendEmailNotification = async (user, { type, title, message, data }) => {
  try {
    // Map notification types to email templates
    const emailTemplates = {
      [NOTIFICATION_TYPES.REQUEST_ACCEPTED]: {
        template: "requestAccepted",
        subject: "Votre demande a été acceptée !",
      },
      [NOTIFICATION_TYPES.REQUEST_REJECTED]: {
        template: "requestRejected",
        subject: "Mise à jour de votre demande",
      },
      [NOTIFICATION_TYPES.NEW_MESSAGE]: {
        template: "newMessage",
        subject: "Nouveau message reçu",
      },
      [NOTIFICATION_TYPES.DELIVERED]: {
        template: "deliveryCompleted",
        subject: "Livraison terminée !",
      },
      [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: {
        template: "paymentReceived",
        subject: "Paiement reçu",
      },
    };

    const emailConfig = emailTemplates[type];

    if (emailConfig) {
      // Use specific template
      return await sendEmail({
        email: user.email,
        subject: emailConfig.subject,
        template: emailConfig.template,
        data: {
          ...data,
          userName: user.firstName,
          userEmail: user.email,
        },
      });
    } else {
      // Use generic notification template
      return await sendEmail({
        email: user.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>🚛 TransportConnect</h1>
              <h2>${title}</h2>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Bonjour ${user.firstName},</p>
              <p>${message}</p>
              ${data.actionUrl ? `<div style="text-align: center; margin: 30px 0;"><a href="${data.actionUrl}" style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir les détails</a></div>` : ""}
              <p>L'équipe TransportConnect</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
              <p>TransportConnect - Votre logistique collaborative</p>
            </div>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error("Email notification error:", error);
    throw error;
  }
};

// Send push notification (placeholder - implement with Firebase, etc.)
const sendPushNotification = async (user, { type, title, message, data }) => {
  try {
    // Placeholder for push notification implementation
    // In production, integrate with Firebase Cloud Messaging, OneSignal, etc.

    console.log(`📱 Push notification sent to ${user.email}: ${title}`);

    return {
      success: true,
      provider: "firebase", // or your chosen provider
      messageId: `push_${Date.now()}`,
    };
  } catch (error) {
    console.error("Push notification error:", error);
    throw error;
  }
};

// Send SMS notification (placeholder - implement with Twilio, etc.)
const sendSMSNotification = async (user, { title, message }) => {
  try {
    // Placeholder for SMS implementation
    // In production, integrate with Twilio, AWS SNS, etc.

    const smsMessage = `${title}\n${message}\n\nTransportConnect`;

    console.log(`📱 SMS sent to ${user.phone}: ${smsMessage}`);

    return {
      success: true,
      provider: "twilio", // or your chosen provider
      messageId: `sms_${Date.now()}`,
    };
  } catch (error) {
    console.error("SMS notification error:", error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = options;

    const userNotifications = notificationStore.get(userId.toString()) || [];

    let filteredNotifications = [...userNotifications];

    // Filter unread only
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(
        (n) => !n.isRead && !isNotificationExpired(n),
      );
    } else {
      // Remove expired notifications
      filteredNotifications = filteredNotifications.filter(
        (n) => !isNotificationExpired(n),
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex,
    );

    return {
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      unreadCount: filteredNotifications.filter((n) => !n.isRead).length,
      page,
      totalPages: Math.ceil(filteredNotifications.length / limit),
    };
  } catch (error) {
    console.error("Get user notifications error:", error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const userNotifications = notificationStore.get(userId.toString()) || [];
    const notification = userNotifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Mark notification as read error:", error);
    throw error;
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (userId) => {
  try {
    const userNotifications = notificationStore.get(userId.toString()) || [];

    userNotifications.forEach((notification) => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
      }
    });

    return userNotifications.length;
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (userId, notificationId) => {
  try {
    const userNotifications = notificationStore.get(userId.toString()) || [];
    const notificationIndex = userNotifications.findIndex(
      (n) => n.id === notificationId,
    );

    if (notificationIndex > -1) {
      userNotifications.splice(notificationIndex, 1);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Delete notification error:", error);
    throw error;
  }
};

// Get unread count
const getUnreadCount = async (userId) => {
  try {
    const userNotifications = notificationStore.get(userId.toString()) || [];
    return userNotifications.filter(
      (n) => !n.isRead && !isNotificationExpired(n),
    ).length;
  } catch (error) {
    console.error("Get unread count error:", error);
    return 0;
  }
};

// Send bulk notifications
const sendBulkNotifications = async (notifications) => {
  const results = [];

  for (const notification of notifications) {
    try {
      const result = await sendNotification(notification);
      results.push({
        userId: notification.userId,
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        userId: notification.userId,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

// Send notification to multiple users
const sendNotificationToUsers = async (userIds, notificationData) => {
  const notifications = userIds.map((userId) => ({
    ...notificationData,
    userId,
  }));

  return await sendBulkNotifications(notifications);
};

// Send system announcement to all users
const sendSystemAnnouncement = async (announcement) => {
  try {
    // Get all active users
    const users = await User.find({ status: "active" }).select("_id");
    const userIds = users.map((user) => user._id);

    return await sendNotificationToUsers(userIds, {
      type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
      title: announcement.title,
      message: announcement.message,
      data: announcement.data || {},
      priority: announcement.priority || "normal",
    });
  } catch (error) {
    console.error("Send system announcement error:", error);
    throw error;
  }
};

// Helper functions
const generateNotificationId = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const isNotificationExpired = (notification) => {
  return (
    notification.expiresAt && new Date() > new Date(notification.expiresAt)
  );
};

// Cleanup expired notifications (run periodically)
const cleanupExpiredNotifications = () => {
  try {
    let cleanedCount = 0;

    for (const [userId, notifications] of notificationStore.entries()) {
      const validNotifications = notifications.filter(
        (n) => !isNotificationExpired(n),
      );

      if (validNotifications.length !== notifications.length) {
        cleanedCount += notifications.length - validNotifications.length;
        notificationStore.set(userId, validNotifications);
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired notifications`);
    }
  } catch (error) {
    console.error("Cleanup expired notifications error:", error);
  }
};

// Start cleanup interval
setInterval(cleanupExpiredNotifications, 60 * 60 * 1000); // Every hour

module.exports = {
  sendNotification,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  sendBulkNotifications,
  sendNotificationToUsers,
  sendSystemAnnouncement,
  NOTIFICATION_TYPES,
  cleanupExpiredNotifications,
};
