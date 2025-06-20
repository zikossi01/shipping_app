import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, Menu, X, User, LogOut, Settings, Package } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    return `/${user.role}/dashboard`;
  };

  const navLinks = [
    { href: "/#features", label: "Fonctionnalités", section: "features" },
    {
      href: "/#how-it-works",
      label: "Comment ça marche",
      section: "how-it-works",
    },
    { href: "/#testimonials", label: "Témoignages", section: "testimonials" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              TransportConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    onClick={(e) => {
                      // If we're already on homepage, scroll to section
                      if (window.location.pathname === "/") {
                        e.preventDefault();
                        const element = document.getElementById(link.section);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                      // Otherwise, Link will navigate to homepage and anchor will work
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              <Link
                to={getDashboardLink()}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Tableau de bord
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/auth"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  S'inscrire
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user?.role === "driver"
                        ? "bg-blue-100"
                        : user?.role === "shipper"
                          ? "bg-orange-100"
                          : "bg-green-100"
                    }`}
                  >
                    {user?.role === "driver" ? (
                      <Truck
                        className={`h-4 w-4 ${
                          user?.role === "driver"
                            ? "text-blue-600"
                            : user?.role === "shipper"
                              ? "text-orange-600"
                              : "text-green-600"
                        }`}
                      />
                    ) : user?.role === "shipper" ? (
                      <Package className="h-4 w-4 text-orange-600" />
                    ) : (
                      <User className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{user?.firstName}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon profil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            {!isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      // If we're already on homepage, scroll to section
                      if (window.location.pathname === "/") {
                        e.preventDefault();
                        const element = document.getElementById(link.section);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 space-y-2">
                  <Link
                    to="/auth"
                    className="block text-center py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/auth"
                    className="block text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to={getDashboardLink()}
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/settings"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Paramètres
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600 font-medium"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
