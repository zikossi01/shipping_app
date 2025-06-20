import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

// Components
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DriverDashboard from "./pages/driver/DriverDashboard.jsx";
import ShipperDashboard from "./pages/shipper/ShipperDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected Driver Routes */}
                <Route
                  path="/driver/dashboard"
                  element={
                    <ProtectedRoute requiredRole="driver">
                      <DriverDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Shipper Routes */}
                <Route
                  path="/shipper/dashboard"
                  element={
                    <ProtectedRoute requiredRole="shipper">
                      <ShipperDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#374151",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e5e7eb",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
