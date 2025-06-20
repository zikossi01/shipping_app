import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, Package, Shield, CheckCircle } from "lucide-react";

import { useAuth } from "../contexts/AuthContext.jsx";
import RoleSelector from "../components/auth/RoleSelector.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoading } = useAuth();

  const initialRole = searchParams.get("role");
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'

  const roles = [
    {
      id: "driver",
      title: "Conducteur",
      description: "J'ai un véhicule et je veux transporter des marchandises",
      icon: Truck,
      color: "blue",
      features: [
        "Publier des annonces de trajet",
        "Gérer les demandes de transport",
        "Optimiser vos revenus",
        "Tableau de bord conducteur",
      ],
    },
    {
      id: "shipper",
      title: "Expéditeur",
      description: "J'ai des marchandises à expédier",
      icon: Package,
      color: "orange",
      features: [
        "Rechercher des transporteurs",
        "Créer des demandes de transport",
        "Suivre vos expéditions",
        "Évaluer les conducteurs",
      ],
    },
    {
      id: "admin",
      title: "Administrateur",
      description: "Accès à la gestion de la plateforme",
      icon: Shield,
      color: "green",
      features: [
        "Gestion des utilisateurs",
        "Supervision des transports",
        "Statistiques de la plateforme",
        "Modération du contenu",
      ],
    },
  ];

  const handleAuthSuccess = (user) => {
    // Redirect based on user role
    const roleRoutes = {
      driver: "/driver/dashboard",
      shipper: "/shipper/dashboard",
      admin: "/admin/dashboard",
    };

    navigate(roleRoutes[user.role] || "/");
  };

  // Show role selection if no role is selected
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <RoleSelector roles={roles} onRoleSelect={setSelectedRole} />
        </div>
      </div>
    );
  }

  const currentRole = roles.find((role) => role.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setSelectedRole(null)}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Changer de profil
          </button>

          <div
            className={`inline-flex p-3 rounded-full mb-4 bg-${currentRole.color}-100 text-${currentRole.color}-600`}
          >
            <currentRole.icon className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold mb-2 font-heading">
            Espace {currentRole.title}
          </h1>
          <p className="text-gray-600">{currentRole.description}</p>
        </div>

        {/* Auth Forms */}
        <div className="bg-white rounded-xl shadow-xl">
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-t-xl">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-tl-xl transition-colors ${
                authMode === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-tr-xl transition-colors ${
                authMode === "register"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              S'inscrire
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {authMode === "login" ? (
              <LoginForm
                role={selectedRole}
                onSuccess={handleAuthSuccess}
                isLoading={isLoading}
              />
            ) : (
              <RegisterForm
                role={selectedRole}
                onSuccess={handleAuthSuccess}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
