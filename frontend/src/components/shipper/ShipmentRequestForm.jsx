import React, { useState } from "react";
import {
  Package,
  MapPin,
  Calendar,
  Weight,
  Ruler,
  DollarSign,
  Clock,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

const ShipmentRequestForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Package Information
    packageType: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    quantity: 1,
    value: "",
    description: "",
    specialInstructions: "",

    // Pickup Information
    pickupAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "France",
    },
    pickupDate: "",
    pickupTimeWindow: {
      start: "",
      end: "",
    },
    pickupContact: {
      name: "",
      phone: "",
      email: "",
    },

    // Delivery Information
    deliveryAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "France",
    },
    deliveryDate: "",
    deliveryTimeWindow: {
      start: "",
      end: "",
    },
    deliveryContact: {
      name: "",
      phone: "",
      email: "",
    },

    // Service Options
    priority: "standard",
    insurance: false,
    signature: false,
    fragile: false,

    // Budget
    budget: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const packageTypes = [
    { value: "document", label: "Documents" },
    { value: "small_package", label: "Petit colis" },
    { value: "medium_package", label: "Colis moyen" },
    { value: "large_package", label: "Gros colis" },
    { value: "pallet", label: "Palette" },
    { value: "furniture", label: "Mobilier" },
    { value: "equipment", label: "Équipement" },
    { value: "other", label: "Autre" },
  ];

  const priorities = [
    { value: "standard", label: "Standard (3-5 jours)", icon: "🚚" },
    { value: "express", label: "Express (1-2 jours)", icon: "⚡" },
    { value: "urgent", label: "Urgent (Même jour)", icon: "🚨" },
  ];

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    const errorKey = section ? `${section}.${field}` : field;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Package validation
    if (!formData.packageType) newErrors.packageType = "Type de colis requis";
    if (!formData.weight) newErrors.weight = "Poids requis";
    if (!formData.description) newErrors.description = "Description requise";

    // Pickup validation
    if (!formData.pickupAddress.street)
      newErrors["pickupAddress.street"] = "Adresse de collecte requise";
    if (!formData.pickupAddress.city)
      newErrors["pickupAddress.city"] = "Ville de collecte requise";
    if (!formData.pickupAddress.postalCode)
      newErrors["pickupAddress.postalCode"] = "Code postal requis";
    if (!formData.pickupDate) newErrors.pickupDate = "Date de collecte requise";
    if (!formData.pickupContact.name)
      newErrors["pickupContact.name"] = "Contact de collecte requis";
    if (!formData.pickupContact.phone)
      newErrors["pickupContact.phone"] = "Téléphone de collecte requis";

    // Delivery validation
    if (!formData.deliveryAddress.street)
      newErrors["deliveryAddress.street"] = "Adresse de livraison requise";
    if (!formData.deliveryAddress.city)
      newErrors["deliveryAddress.city"] = "Ville de livraison requise";
    if (!formData.deliveryAddress.postalCode)
      newErrors["deliveryAddress.postalCode"] = "Code postal requis";
    if (!formData.deliveryDate)
      newErrors.deliveryDate = "Date de livraison requise";
    if (!formData.deliveryContact.name)
      newErrors["deliveryContact.name"] = "Contact de livraison requis";
    if (!formData.deliveryContact.phone)
      newErrors["deliveryContact.phone"] = "Téléphone de livraison requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting shipment request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
        <h2 className="text-2xl font-bold flex items-center">
          <Package className="mr-3 h-6 w-6" />
          Nouvelle demande d'expédition
        </h2>
        <p className="mt-2 opacity-90">
          Remplissez les détails de votre expédition pour recevoir des devis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Package Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            📦 Informations du colis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de colis *
              </label>
              <select
                value={formData.packageType}
                onChange={(e) =>
                  handleChange(null, "packageType", e.target.value)
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.packageType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Sélectionner un type</option>
                {packageTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.packageType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.packageType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg) *
              </label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleChange(null, "weight", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.weight ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: 5.2"
                />
              </div>
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longueur (cm)
              </label>
              <input
                type="number"
                value={formData.dimensions.length}
                onChange={(e) =>
                  handleChange("dimensions", "length", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largeur (cm)
              </label>
              <input
                type="number"
                value={formData.dimensions.width}
                onChange={(e) =>
                  handleChange("dimensions", "width", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hauteur (cm)
              </label>
              <input
                type="number"
                value={formData.dimensions.height}
                onChange={(e) =>
                  handleChange("dimensions", "height", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du contenu *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                handleChange(null, "description", e.target.value)
              }
              rows={3}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Décrivez le contenu du colis..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Pickup Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            📍 Informations de collecte
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={formData.pickupAddress.street}
                  onChange={(e) =>
                    handleChange("pickupAddress", "street", e.target.value)
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors["pickupAddress.street"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="123 Rue de la Paix"
                />
                {errors["pickupAddress.street"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["pickupAddress.street"]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress.city}
                    onChange={(e) =>
                      handleChange("pickupAddress", "city", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors["pickupAddress.city"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Paris"
                  />
                  {errors["pickupAddress.city"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["pickupAddress.city"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress.postalCode}
                    onChange={(e) =>
                      handleChange(
                        "pickupAddress",
                        "postalCode",
                        e.target.value,
                      )
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors["pickupAddress.postalCode"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="75001"
                  />
                  {errors["pickupAddress.postalCode"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["pickupAddress.postalCode"]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de collecte *
                </label>
                <input
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) =>
                    handleChange(null, "pickupDate", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.pickupDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.pickupDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.pickupDate}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={formData.pickupTimeWindow.start}
                    onChange={(e) =>
                      handleChange("pickupTimeWindow", "start", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure fin
                  </label>
                  <input
                    type="time"
                    value={formData.pickupTimeWindow.end}
                    onChange={(e) =>
                      handleChange("pickupTimeWindow", "end", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact *
              </label>
              <input
                type="text"
                value={formData.pickupContact.name}
                onChange={(e) =>
                  handleChange("pickupContact", "name", e.target.value)
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors["pickupContact.name"]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Jean Dupont"
              />
              {errors["pickupContact.name"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["pickupContact.name"]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.pickupContact.phone}
                onChange={(e) =>
                  handleChange("pickupContact", "phone", e.target.value)
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors["pickupContact.phone"]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="+33 6 12 34 56 78"
              />
              {errors["pickupContact.phone"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["pickupContact.phone"]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.pickupContact.email}
                onChange={(e) =>
                  handleChange("pickupContact", "email", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="contact@exemple.fr"
              />
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            🎯 Informations de livraison
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress.street}
                  onChange={(e) =>
                    handleChange("deliveryAddress", "street", e.target.value)
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors["deliveryAddress.street"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="456 Avenue des Champs"
                />
                {errors["deliveryAddress.street"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["deliveryAddress.street"]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.city}
                    onChange={(e) =>
                      handleChange("deliveryAddress", "city", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors["deliveryAddress.city"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Lyon"
                  />
                  {errors["deliveryAddress.city"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["deliveryAddress.city"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.postalCode}
                    onChange={(e) =>
                      handleChange(
                        "deliveryAddress",
                        "postalCode",
                        e.target.value,
                      )
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors["deliveryAddress.postalCode"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="69001"
                  />
                  {errors["deliveryAddress.postalCode"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["deliveryAddress.postalCode"]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de livraison *
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    handleChange(null, "deliveryDate", e.target.value)
                  }
                  min={
                    formData.pickupDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.deliveryDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.deliveryDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.deliveryDate}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={formData.deliveryTimeWindow.start}
                    onChange={(e) =>
                      handleChange(
                        "deliveryTimeWindow",
                        "start",
                        e.target.value,
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure fin
                  </label>
                  <input
                    type="time"
                    value={formData.deliveryTimeWindow.end}
                    onChange={(e) =>
                      handleChange("deliveryTimeWindow", "end", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact *
              </label>
              <input
                type="text"
                value={formData.deliveryContact.name}
                onChange={(e) =>
                  handleChange("deliveryContact", "name", e.target.value)
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors["deliveryContact.name"]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Marie Martin"
              />
              {errors["deliveryContact.name"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["deliveryContact.name"]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.deliveryContact.phone}
                onChange={(e) =>
                  handleChange("deliveryContact", "phone", e.target.value)
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors["deliveryContact.phone"]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="+33 6 87 65 43 21"
              />
              {errors["deliveryContact.phone"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["deliveryContact.phone"]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.deliveryContact.email}
                onChange={(e) =>
                  handleChange("deliveryContact", "email", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="livraison@exemple.fr"
              />
            </div>
          </div>
        </div>

        {/* Service Options */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            ⚙️ Options de service
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priorité de livraison
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priorities.map((priority) => (
                <label
                  key={priority.value}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.priority === priority.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) =>
                      handleChange(null, "priority", e.target.value)
                    }
                    className="mr-3"
                  />
                  <span className="text-2xl mr-2">{priority.icon}</span>
                  <span className="font-medium">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.insurance}
                onChange={(e) =>
                  handleChange(null, "insurance", e.target.checked)
                }
                className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Assurance transport
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.signature}
                onChange={(e) =>
                  handleChange(null, "signature", e.target.checked)
                }
                className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Signature requise
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.fragile}
                onChange={(e) =>
                  handleChange(null, "fragile", e.target.checked)
                }
                className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Fragile</span>
            </label>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            💰 Budget
          </h3>

          <div className="max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget maximum (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleChange(null, "budget", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="100.00"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Optionnel - Aide les conducteurs à vous proposer des tarifs
              adaptés
            </p>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            📝 Instructions spéciales
          </h3>

          <div>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) =>
                handleChange(null, "specialInstructions", e.target.value)
              }
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Instructions particulières pour la collecte ou la livraison..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Package className="mr-2 h-5 w-5" />
                Créer la demande
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentRequestForm;
