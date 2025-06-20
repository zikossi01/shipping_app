import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  DollarSign,
  Star,
  MapPin,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import DeliveryCard from "../../components/driver/DeliveryCard.jsx";
import toast from "react-hot-toast";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock delivery data - In real app, this would come from API
  useEffect(() => {
    const mockDeliveries = [
      {
        id: "DEL001",
        status: "assigned",
        description: "Équipement informatique",
        weight: 15.5,
        packageType: "Matériel électronique",
        priority: "express",
        pickupDate: "2024-01-25",
        deliveryDate: "2024-01-25",
        pickupTimeWindow: "09:00 - 12:00",
        deliveryTimeWindow: "14:00 - 18:00",
        pickupAddress: {
          street: "123 Rue de la Technologie",
          city: "Paris",
          postalCode: "75001",
        },
        deliveryAddress: {
          street: "456 Avenue Innovation",
          city: "Lyon",
          postalCode: "69001",
        },
        pickupContact: {
          name: "Jean Dupont",
          phone: "+33 6 12 34 56 78",
          email: "jean@techcorp.fr",
        },
        deliveryContact: {
          name: "Marie Martin",
          phone: "+33 6 87 65 43 21",
          email: "marie@innovate.fr",
        },
        agreedPrice: 180,
        distance: 462,
        estimatedDuration: "4h 30min",
        fragile: true,
        signature: true,
        insurance: true,
        dimensions: { length: 60, width: 40, height: 30 },
        value: 2500,
        specialInstructions:
          "Livraison en étage, ascenseur disponible. Prendre rendez-vous avant livraison.",
      },
      {
        id: "DEL002",
        status: "picked_up",
        description: "Documents juridiques",
        weight: 2.3,
        packageType: "Documents",
        priority: "urgent",
        pickupDate: "2024-01-24",
        deliveryDate: "2024-01-24",
        pickupTimeWindow: "08:00 - 10:00",
        deliveryTimeWindow: "16:00 - 18:00",
        pickupAddress: {
          street: "789 Boulevard Justice",
          city: "Marseille",
          postalCode: "13001",
        },
        deliveryAddress: {
          street: "321 Rue Tribunal",
          city: "Nice",
          postalCode: "06000",
        },
        pickupContact: {
          name: "Pierre Avocat",
          phone: "+33 4 91 23 45 67",
          email: "pierre@cabinet-legal.fr",
        },
        deliveryContact: {
          name: "Sophie Juge",
          phone: "+33 4 93 87 65 43",
          email: "sophie@tribunal-nice.fr",
        },
        agreedPrice: 120,
        distance: 200,
        estimatedDuration: "2h 45min",
        fragile: false,
        signature: true,
        insurance: false,
        specialInstructions: "Livraison urgente, tribunal ferme à 17h00.",
      },
      {
        id: "DEL003",
        status: "in_transit",
        description: "Mobilier de bureau",
        weight: 45.8,
        packageType: "Mobilier",
        priority: "standard",
        pickupDate: "2024-01-23",
        deliveryDate: "2024-01-24",
        pickupTimeWindow: "10:00 - 12:00",
        deliveryTimeWindow: "09:00 - 17:00",
        pickupAddress: {
          street: "555 Zone Industrielle",
          city: "Bordeaux",
          postalCode: "33000",
        },
        deliveryAddress: {
          street: "777 Centre Affaires",
          city: "Toulouse",
          postalCode: "31000",
        },
        pickupContact: {
          name: "Marc Furniture",
          phone: "+33 5 56 12 34 56",
          email: "marc@mobilpro.fr",
        },
        deliveryContact: {
          name: "Claire Bureau",
          phone: "+33 5 61 87 65 43",
          email: "claire@office-space.fr",
        },
        agreedPrice: 250,
        distance: 245,
        estimatedDuration: "3h 15min",
        fragile: true,
        signature: true,
        insurance: true,
        dimensions: { length: 120, width: 80, height: 75 },
        value: 1800,
        specialInstructions: "Montage requis sur site. Outils fournis.",
      },
      {
        id: "DEL004",
        status: "delivered",
        description: "Colis e-commerce",
        weight: 3.2,
        packageType: "Petit colis",
        priority: "standard",
        pickupDate: "2024-01-22",
        deliveryDate: "2024-01-22",
        pickupTimeWindow: "14:00 - 16:00",
        deliveryTimeWindow: "17:00 - 20:00",
        pickupAddress: {
          street: "100 Entrepôt Central",
          city: "Rennes",
          postalCode: "35000",
        },
        deliveryAddress: {
          street: "25 Rue Résidentielle",
          city: "Nantes",
          postalCode: "44000",
        },
        pickupContact: {
          name: "Service Logistique",
          phone: "+33 2 99 12 34 56",
          email: "logistique@ecommerce.fr",
        },
        deliveryContact: {
          name: "Client Final",
          phone: "+33 2 40 87 65 43",
          email: "client@email.fr",
        },
        agreedPrice: 35,
        distance: 110,
        estimatedDuration: "1h 30min",
        fragile: false,
        signature: false,
        insurance: false,
        deliveredAt: "2024-01-22T18:30:00",
        rating: 5,
      },
    ];
    setDeliveries(mockDeliveries);
  }, []);

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.pickupAddress.city
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      delivery.deliveryAddress.city
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      delivery.status === statusFilter ||
      (activeTab === "active" &&
        ["assigned", "picked_up", "in_transit"].includes(delivery.status)) ||
      (activeTab === "completed" && delivery.status === "delivered");

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" &&
        ["assigned", "picked_up", "in_transit"].includes(delivery.status)) ||
      (activeTab === "completed" && delivery.status === "delivered");

    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStats = () => {
    const today = new Date().toISOString().split("T")[0];
    return {
      active: deliveries.filter((d) =>
        ["assigned", "picked_up", "in_transit"].includes(d.status),
      ).length,
      todayDeliveries: deliveries.filter(
        (d) => d.deliveryDate === today && d.status !== "delivered",
      ).length,
      totalEarnings: deliveries
        .filter((d) => d.status === "delivered")
        .reduce((sum, d) => sum + d.agreedPrice, 0),
      avgRating: 4.8, // Would be calculated from actual ratings
    };
  };

  const stats = getStats();

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDeliveries((prev) =>
        prev.map((delivery) =>
          delivery.id === deliveryId
            ? { ...delivery, status: newStatus }
            : delivery,
        ),
      );

      const statusLabels = {
        picked_up: "Collecte confirmée",
        in_transit: "Transport commencé",
        delivered: "Livraison confirmée",
      };

      toast.success(statusLabels[newStatus] || "Statut mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const tabs = [
    { id: "active", label: "Livraisons actives", count: stats.active },
    {
      id: "completed",
      label: "Terminées",
      count: deliveries.filter((d) => d.status === "delivered").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord Conducteur
            </h1>
            <p className="text-gray-600">
              Bonjour {user?.firstName}, gérez vos livraisons efficacement
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Livraisons actives
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Aujourd'hui
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.todayDeliveries}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Revenus totaux
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{stats.totalEarnings}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Note moyenne
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgRating}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Status Overview */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold mb-2">Statut du jour</h2>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>
                        {
                          deliveries.filter(
                            (d) =>
                              d.status === "delivered" &&
                              d.deliveryDate ===
                                new Date().toISOString().split("T")[0],
                          ).length
                        }{" "}
                        livrées aujourd'hui
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{stats.todayDeliveries} en cours</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      €
                      {deliveries
                        .filter(
                          (d) =>
                            d.deliveryDate ===
                              new Date().toISOString().split("T")[0] &&
                            d.status === "delivered",
                        )
                        .reduce((sum, d) => sum + d.agreedPrice, 0)}
                    </div>
                    <div className="text-sm opacity-90">Revenus du jour</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="assigned">Assigné</option>
                    <option value="picked_up">Collecté</option>
                    <option value="in_transit">En transit</option>
                    <option value="delivered">Livré</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Deliveries List */}
            <div className="p-6">
              {filteredDeliveries.length > 0 ? (
                <div className="space-y-6">
                  {filteredDeliveries.map((delivery) => (
                    <DeliveryCard
                      key={delivery.id}
                      delivery={delivery}
                      onStatusUpdate={handleStatusUpdate}
                      onViewDetails={(id) =>
                        console.log("View details for", id)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucune livraison trouvée
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {deliveries.length === 0
                      ? "Vous n'avez pas encore de livraisons assignées."
                      : "Essayez de modifier vos critères de recherche."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
