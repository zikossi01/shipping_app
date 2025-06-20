import React from "react";
import { CheckCircle } from "lucide-react";

const RoleSelector = ({ roles, onRoleSelect }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
          Choisissez votre profil
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sélectionnez le type de compte qui correspond à vos besoins pour
          accéder aux fonctionnalités appropriées
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-200 group"
          >
            <div className="text-center">
              <div
                className={`inline-flex p-4 rounded-full mb-4 bg-${role.color}-100 text-${role.color}-600 group-hover:bg-${role.color}-200 transition-colors`}
              >
                <role.icon className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {role.title}
              </h3>
              <p className="text-gray-600 mb-6">{role.description}</p>

              <div className="space-y-3">
                {role.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle
                      className={`h-4 w-4 text-${role.color}-600 mr-2 flex-shrink-0`}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full mt-6 bg-gradient-to-r from-${role.color}-500 to-${role.color}-600 text-white py-3 px-4 rounded-lg font-medium hover:from-${role.color}-600 hover:to-${role.color}-700 transition-all duration-200 transform group-hover:scale-105`}
              >
                Choisir ce profil
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Vous pourrez modifier votre profil plus tard dans les paramètres
        </p>
      </div>
    </div>
  );
};

export default RoleSelector;
