import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRoutes = {
      driver: "/driver/dashboard",
      shipper: "/shipper/dashboard",
      admin: "/admin/dashboard",
    };

    return <Navigate to={roleRoutes[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
