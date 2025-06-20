import React, { createContext, useContext, useReducer, useEffect } from "react";
import toast from "react-hot-toast";
import authService from "../services/authService";

const AuthContext = createContext();

// Auth state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth actions
const AUTH_ACTIONS = {
  AUTH_START: "AUTH_START",
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_FAILURE: "AUTH_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER: "UPDATE_USER",
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: { user, token },
          });
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({
            type: AUTH_ACTIONS.AUTH_FAILURE,
            payload: "Session expirée",
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: null,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });

    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;

      localStorage.setItem("token", token);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Bienvenue ${user.firstName} !`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Erreur de connexion";

      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: message,
      });

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });

    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;

      localStorage.setItem("token", token);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user, token },
      });

      toast.success("Compte créé avec succès !");
      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de l'inscription";

      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: message,
      });

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success("Déconnexion réussie");
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data,
      });

      toast.success("Profil mis à jour");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Erreur de mise à jour";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
