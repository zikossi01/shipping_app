import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  MapPin,
  Calendar,
  Weight,
  DollarSign,
  Star,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import ShipmentRequestForm from "../../components/shipper/ShipmentRequestForm.jsx";
import toast from "react-hot-toast";

const ShipperDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock shipment data - In real app, this would come from API
  useEffect(() => {
    const mockShipments = [
      {
        id: "SH001",
        status: "pending_quotes",
        packageType: "medium_package",
        weight: 15.5,
        description: "Équipement informatique",
        pickupCity: "Paris",
        deliveryCity: "Lyon",
        pickupDate: "2024-01-25",
        deliveryDate: "2024-01-27",
        budget: 150,
        quotes: 3,
        createdAt: "2024-01-20",
        priority: "standard",
      },
      {
        id: "SH002",
        status: "in_transit",
        packageType: "small_package",
        weight: 2.3,
        description: "Documents juridiques",
        pickupCity: "Marseille",
        deliveryCity: "Nice",
        pickupDate: "2024-01-22",
        deliveryDate: "2024-01-23",
        budget: 50,
        assignedDriver: "Pierre Martin",
        trackingNumber: "TRK123456",
        createdAt: "2024-01-18",
        priority: "express",
      },
      {
        id: "SH003",
        status: "delivered",
        packageType: "large_package",
        weight: 25.0,
        description: "Mobilier de bureau",
        pickupCity: "Bordeaux",
        deliveryCity: "Toulouse",
        pickupDate: "2024-01-15",
        deliveryDate: "2024-01-17",
        budget: 200,
        assignedDriver: "Sophie Laurent",
        deliveredAt: "2024-01-17T14:30:00",
        rating: 5,
        createdAt: "2024-01-12",
        priority: "standard",
      },
    ];
    setShipments(mockShipments);
  }, []);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending_quotes: {
        label: "En attente de devis",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      quoted: {
        label: "Devis reçus",
        color: "bg-blue-100 text-blue-800",
        icon: DollarSign,
      },
      in_transit: {
        label: "En transit",
        color: "bg-orange-100 text-orange-800",
        icon: Truck,
      },
      delivered: {
        label: "Livré",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Annulé",
        color: "bg-red-100 text-red-800",
        icon: X,
      },
    };
    return statusMap[status] || statusMap.pending_quotes;
  };

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      standard: { label: "Standard", color: "text-gray-600", icon: "🚚" },
      express: { label: "Express", color: "text-orange-600", icon: "⚡" },
      urgent: { label: "Urgent", color: "text-red-600", icon: "🚨" },
    };
    return priorityMap[priority] || priorityMap.standard;
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.pickupCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.deliveryCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    return {
      pending: shipments.filter((s) => s.status === "pending_quotes").length,
      inTransit: shipments.filter((s) => s.status === "in_transit").length,
      quoted: shipments.filter((s) => s.status === "quoted").length,
      delivered: shipments.filter((s) => s.status === "delivered").length,
    };
  };

  const stats = getStats();

  const handleNewRequest = async (requestData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newShipment = {
        id: `SH${String(shipments.length + 1).padStart(3, "0")}`,
        status: "pending_quotes",
        ...requestData,
        quotes: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setShipments((prev) => [newShipment, ...prev]);
      setShowNewRequestForm(false);
      toast.success("Demande d'expédition créée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la création de la demande");
    }
  };

  if (showNewRequestForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-8 px-4">
          <ShipmentRequestForm
            onSubmit={handleNewRequest}
            onCancel={() => setShowNewRequestForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord Expéditeur
            </h1>
            <p className="text-gray-600">
              Bonjour {user?.firstName}, gérez vos expéditions en toute
              simplicité
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    En attente
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Devis reçus
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.quoted}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    En transit
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inTransit}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Livrés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.delivered}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold mb-2">
                    Nouvelle expédition
                  </h2>
                  <p className="opacity-90">
                    Créez une demande de transport et recevez des devis de
                    conducteurs vérifiés
                  </p>
                </div>
                <button
                  onClick={() => setShowNewRequestForm(true)}
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Créer une demande
                </button>
              </div>
            </div>
          </div>

          {/* Shipments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes expéditions
                </h2>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending_quotes">En attente</option>
                    <option value="quoted">Devis reçus</option>
                    <option value="in_transit">En transit</option>
                    <option value="delivered">Livrés</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expédition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trajet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => {
                    const statusInfo = getStatusInfo(shipment.status);
                    const priorityInfo = getPriorityInfo(shipment.priority);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-orange-100 p-2 rounded-lg mr-3">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {shipment.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {shipment.description}
                              </div>
                              <div className="flex items-center mt-1">
                                <Weight className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                  {shipment.weight} kg
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span
                                  className={`text-xs ${priorityInfo.color}`}
                                >
                                  {priorityInfo.icon} {priorityInfo.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            <span>
                              {shipment.pickupCity} → {shipment.deliveryCity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span>Collecte: {shipment.pickupDate}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span>Livraison: {shipment.deliveryDate}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </span>
                          {shipment.quotes > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              {shipment.quotes} devis reçus
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.budget
                            ? `€${shipment.budget}`
                            : "Non spécifié"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                              <Eye className="h-4 w-4" />
                            </button>
                            {shipment.status === "pending_quotes" && (
                              <button className="text-orange-600 hover:text-orange-900 p-1 rounded">
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {shipment.status === "delivered" &&
                              shipment.rating && (
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-600 ml-1">
                                    {shipment.rating}
                                  </span>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredShipments.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Aucune expédition trouvée
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {shipments.length === 0
                    ? "Commencez par créer votre première demande d'expédition."
                    : "Essayez de modifier vos critères de recherche."}
                </p>
                {shipments.length === 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowNewRequestForm(true)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Créer ma première demande
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;
