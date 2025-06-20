import React, { useState } from "react";
import {
  Package,
  MapPin,
  Calendar,
  Clock,
  Weight,
  Phone,
  User,
  DollarSign,
  CheckCircle,
  X,
  Navigation,
  Camera,
  FileText,
  AlertCircle,
} from "lucide-react";

const DeliveryCard = ({ delivery, onStatusUpdate, onViewDetails }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusInfo = (status) => {
    const statusMap = {
      assigned: {
        label: "Assigné",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        actionColor: "bg-blue-600 hover:bg-blue-700",
      },
      picked_up: {
        label: "Collecté",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        actionColor: "bg-orange-600 hover:bg-orange-700",
      },
      in_transit: {
        label: "En transit",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        actionColor: "bg-purple-600 hover:bg-purple-700",
      },
      delivered: {
        label: "Livré",
        color: "bg-green-100 text-green-800 border-green-200",
        actionColor: "bg-green-600 hover:bg-green-700",
      },
    };
    return statusMap[status] || statusMap.assigned;
  };

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      standard: { label: "Standard", color: "text-gray-600", icon: "🚚" },
      express: { label: "Express", color: "text-orange-600", icon: "⚡" },
      urgent: { label: "Urgent", color: "text-red-600", icon: "🚨" },
    };
    return priorityMap[priority] || priorityMap.standard;
  };

  const getNextAction = (status) => {
    const actionMap = {
      assigned: { text: "Confirmer collecte", nextStatus: "picked_up" },
      picked_up: { text: "Commencer livraison", nextStatus: "in_transit" },
      in_transit: { text: "Confirmer livraison", nextStatus: "delivered" },
      delivered: { text: "Terminé", nextStatus: null },
    };
    return actionMap[status];
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(delivery.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusInfo = getStatusInfo(delivery.status);
  const priorityInfo = getPriorityInfo(delivery.priority);
  const nextAction = getNextAction(delivery.status);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {delivery.id}
              </h3>
              <p className="text-gray-600 mt-1">{delivery.description}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <Weight className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {delivery.weight} kg
                  </span>
                </div>
                <span className={`text-sm ${priorityInfo.color} font-medium`}>
                  {priorityInfo.icon} {priorityInfo.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FileText className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <MapPin className="h-4 w-4 text-green-600 mr-2" />
              Collecte
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span>{delivery.pickupDate}</span>
                {delivery.pickupTimeWindow && (
                  <span className="ml-2 text-gray-500">
                    {delivery.pickupTimeWindow}
                  </span>
                )}
              </div>
              <div className="text-gray-600">
                {delivery.pickupAddress.street}
                <br />
                {delivery.pickupAddress.city},{" "}
                {delivery.pickupAddress.postalCode}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{delivery.pickupContact.name}</span>
                </div>
                <a
                  href={`tel:${delivery.pickupContact.phone}`}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{delivery.pickupContact.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <MapPin className="h-4 w-4 text-red-600 mr-2" />
              Livraison
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span>{delivery.deliveryDate}</span>
                {delivery.deliveryTimeWindow && (
                  <span className="ml-2 text-gray-500">
                    {delivery.deliveryTimeWindow}
                  </span>
                )}
              </div>
              <div className="text-gray-600">
                {delivery.deliveryAddress.street}
                <br />
                {delivery.deliveryAddress.city},{" "}
                {delivery.deliveryAddress.postalCode}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{delivery.deliveryContact.name}</span>
                </div>
                <a
                  href={`tel:${delivery.deliveryContact.phone}`}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{delivery.deliveryContact.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details (Expandable) */}
      {showDetails && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">
                Informations colis
              </h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>{" "}
                  <span className="text-gray-900">{delivery.packageType}</span>
                </div>
                {delivery.dimensions && (
                  <div>
                    <span className="text-gray-500">Dimensions:</span>{" "}
                    <span className="text-gray-900">
                      {delivery.dimensions.length} x {delivery.dimensions.width}{" "}
                      x {delivery.dimensions.height} cm
                    </span>
                  </div>
                )}
                {delivery.value && (
                  <div>
                    <span className="text-gray-500">Valeur:</span>{" "}
                    <span className="text-gray-900">€{delivery.value}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {delivery.fragile && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Fragile
                    </span>
                  )}
                  {delivery.signature && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Signature requise
                    </span>
                  )}
                  {delivery.insurance && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Assuré
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3">Rémunération</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Montant convenu:</span>
                  <span className="font-medium text-lg text-green-600">
                    €{delivery.agreedPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Distance:</span>
                  <span className="text-gray-900">{delivery.distance} km</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Durée estimée:</span>
                  <span className="text-gray-900">
                    {delivery.estimatedDuration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {delivery.specialInstructions && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-2">
                Instructions spéciales
              </h5>
              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                {delivery.specialInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Navigation */}
          <button
            onClick={() =>
              window.open(
                `https://maps.google.com/maps?daddr=${delivery.pickupAddress.street}, ${delivery.pickupAddress.city}`,
                "_blank",
              )
            }
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigation
          </button>

          {/* Camera/Proof */}
          {(delivery.status === "picked_up" ||
            delivery.status === "in_transit") && (
            <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Camera className="h-4 w-4 mr-2" />
              Photo preuve
            </button>
          )}

          {/* Status Update */}
          {nextAction.nextStatus && (
            <button
              onClick={() => handleStatusUpdate(nextAction.nextStatus)}
              disabled={isUpdating}
              className={`flex-1 flex items-center justify-center px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${statusInfo.actionColor}`}
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {nextAction.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryCard;
