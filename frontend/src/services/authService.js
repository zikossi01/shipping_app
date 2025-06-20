import axios from "axios";

// Create axios instance with base configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  },
);

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response;
    } catch (error) {
      // For demo purposes, simulate successful login
      if (!error.response) {
        // Simulate API response for demo
        return {
          data: {
            user: {
              id: "1",
              firstName: credentials.email.split("@")[0],
              lastName: "User",
              email: credentials.email,
              role: credentials.role || "shipper",
              phone: "+33 6 12 34 56 78",
              avatar: null,
            },
            token: "demo_token_" + Date.now(),
          },
        };
      }
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response;
    } catch (error) {
      // For demo purposes, simulate successful registration
      if (!error.response) {
        // Simulate API response for demo
        return {
          data: {
            user: {
              id: "1",
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              role: userData.role,
              phone: userData.phone,
              avatar: null,
            },
            token: "demo_token_" + Date.now(),
          },
        };
      }
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      // For demo purposes, return mock user data
      if (!error.response) {
        const token = localStorage.getItem("token");
        if (token) {
          return {
            id: "1",
            firstName: "Demo",
            lastName: "User",
            email: "demo@transportconnect.fr",
            role: "shipper",
            phone: "+33 6 12 34 56 78",
            avatar: null,
          };
        }
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put("/auth/profile", userData);
      return response;
    } catch (error) {
      // For demo purposes, simulate successful update
      if (!error.response) {
        return {
          data: userData,
        };
      }
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.log("Logout API call failed, continuing with local logout");
    } finally {
      localStorage.removeItem("token");
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
