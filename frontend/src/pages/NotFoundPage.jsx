import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
