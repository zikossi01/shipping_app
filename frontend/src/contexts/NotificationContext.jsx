import React, { createContext, useContext, useReducer, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext.jsx";

const NotificationContext = createContext();

// Notification state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Notification actions
const NOTIFICATION_ACTIONS = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_FAILURE: "FETCH_FAILURE",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  MARK_AS_READ: "MARK_AS_READ",
  MARK_ALL_AS_READ: "MARK_ALL_AS_READ",
  DELETE_NOTIFICATION: "DELETE_NOTIFICATION",
  UPDATE_UNREAD_COUNT: "UPDATE_UNREAD_COUNT",
};

// Notification reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.FETCH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case NOTIFICATION_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        isLoading: false,
        error: null,
      };

    case NOTIFICATION_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.isRead ? 0 : 1),
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, isRead: true } : notif,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      return {
        ...state,
        notifications: state.notifications.filter(
          (notif) => notif.id !== action.payload,
        ),
        unreadCount:
          notification && !notification.isRead
            ? state.unreadCount - 1
            : state.unreadCount,
      };

    case NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };

    default:
      return state;
  }
}

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START });

    try {
      // Mock API call - replace with actual service
      const mockNotifications = [
        {
          id: "1",
          title: "Nouvelle demande de transport",
          message:
            "Vous avez reçu une nouvelle demande pour votre trajet Paris-Lyon",
          type: "new_request",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Transport terminé",
          message: "Votre colis a été livré avec succès",
          type: "delivery_completed",
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
        payload: {
          notifications: mockNotifications,
          unreadCount,
        },
      });
    } catch (error) {
      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_FAILURE,
        payload: error.message || "Erreur lors du chargement des notifications",
      });
    }
  };

  // Add new notification
  const addNotification = (notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: {
        id: Date.now().toString(),
        ...notification,
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    });

    // Show toast notification
    toast.success(notification.title, {
      duration: 4000,
    });
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Mock API call - replace with actual service
      await new Promise((resolve) => setTimeout(resolve, 100));

      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_READ,
        payload: notificationId,
      });
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Mock API call - replace with actual service
      await new Promise((resolve) => setTimeout(resolve, 200));

      dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // Mock API call - replace with actual service
      await new Promise((resolve) => setTimeout(resolve, 100));

      dispatch({
        type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION,
        payload: notificationId,
      });
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Show success notification
  const showSuccess = (message) => {
    toast.success(message);
  };

  // Show error notification
  const showError = (message) => {
    toast.error(message);
  };

  // Show info notification
  const showInfo = (message) => {
    toast(message, {
      icon: "ℹ️",
    });
  };

  const value = {
    ...state,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}

export default NotificationContext;
