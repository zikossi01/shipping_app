import React from "react";
import { Users, Truck, Package, BarChart } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tableau de bord Administrateur
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Utilisateurs</h3>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Conducteurs</h3>
                <p className="text-2xl font-bold text-gray-900">456</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Transports</h3>
                <p className="text-2xl font-bold text-gray-900">789</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Revenus</h3>
                <p className="text-2xl font-bold text-gray-900">€45,678</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Panneau d'administration
          </h2>
          <p className="text-gray-600">
            Gérez la plateforme, supervisez les utilisateurs et analysez les
            performances de TransportConnect.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
