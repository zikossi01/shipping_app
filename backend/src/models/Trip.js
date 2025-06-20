const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le conducteur est requis"],
    },

    // Route information
    route: {
      departure: {
        address: {
          type: String,
          required: [true, "L'adresse de départ est requise"],
        },
        city: {
          type: String,
          required: [true, "La ville de départ est requise"],
        },
        postalCode: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      destination: {
        address: {
          type: String,
          required: [true, "L'adresse de destination est requise"],
        },
        city: {
          type: String,
          required: [true, "La ville de destination est requise"],
        },
        postalCode: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      intermediateStops: [
        {
          address: String,
          city: String,
          postalCode: String,
          coordinates: {
            latitude: Number,
            longitude: Number,
          },
          estimatedArrival: Date,
        },
      ],
      estimatedDistance: Number, // in km
      estimatedDuration: Number, // in minutes
    },

    // Schedule
    schedule: {
      departureDate: {
        type: Date,
        required: [true, "La date de départ est requise"],
      },
      departureTime: {
        type: String,
        required: [true, "L'heure de départ est requise"],
        match: [
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Format d'heure invalide (HH:MM)",
        ],
      },
      estimatedArrival: Date,
      flexibility: {
        type: String,
        enum: ["strict", "flexible-1h", "flexible-2h", "flexible-half-day"],
        default: "strict",
      },
    },

    // Capacity and restrictions
    capacity: {
      maxWeight: {
        type: Number,
        required: [true, "Le poids maximum est requis"],
        min: [1, "Le poids maximum doit être positif"],
      },
      maxVolume: Number, // in m³
      availableWeight: Number, // remaining capacity
      availableVolume: Number,
      maxLength: Number, // in cm
      maxWidth: Number, // in cm
      maxHeight: Number, // in cm
    },

    // Goods restrictions
    allowedGoods: [
      {
        type: String,
        enum: [
          "general",
          "fragile",
          "furniture",
          "electronics",
          "food",
          "clothing",
          "books",
          "automotive",
          "garden",
          "sports",
          "medical",
          "industrial",
          "art",
          "other",
        ],
        default: ["general"],
      },
    ],

    restrictedGoods: [
      {
        type: String,
        enum: [
          "dangerous",
          "flammable",
          "toxic",
          "explosive",
          "corrosive",
          "radioactive",
          "living-animals",
          "perishable-food",
          "liquids",
        ],
      },
    ],

    // Pricing
    pricing: {
      basePrice: {
        type: Number,
        required: [true, "Le prix de base est requis"],
        min: [0, "Le prix ne peut pas être négatif"],
      },
      pricePerKg: Number,
      pricePerKm: Number,
      currency: {
        type: String,
        default: "EUR",
      },
      negotiable: {
        type: Boolean,
        default: false,
      },
    },

    // Trip status
    status: {
      type: String,
      enum: ["draft", "published", "in-progress", "completed", "cancelled"],
      default: "draft",
    },

    // Vehicle information
    vehicle: {
      type: {
        type: String,
        enum: ["van", "truck", "semi-truck", "other"],
        required: true,
      },
      licensePlate: String,
      features: [
        {
          type: String,
          enum: [
            "air-conditioning",
            "refrigerated",
            "covered",
            "gps-tracking",
            "loading-assistance",
            "insurance-included",
            "express-delivery",
          ],
        },
      ],
    },

    // Requests and bookings
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],

    acceptedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],

    // Trip completion
    completion: {
      actualDepartureTime: Date,
      actualArrivalTime: Date,
      actualDistance: Number,
      actualDuration: Number,
      fuelCost: Number,
      tollCost: Number,
      totalEarnings: Number,
      notes: String,
    },

    // Communication
    allowMessages: {
      type: Boolean,
      default: true,
    },

    // Special instructions
    specialInstructions: {
      type: String,
      maxlength: [
        500,
        "Les instructions ne peuvent pas dépasser 500 caractères",
      ],
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },

    // Admin fields
    isPromoted: {
      type: Boolean,
      default: false,
    },

    adminNotes: String,

    flagged: {
      type: Boolean,
      default: false,
    },

    flaggedReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ "schedule.departureDate": 1 });
tripSchema.index({ "route.departure.city": 1, "route.destination.city": 1 });
tripSchema.index({ allowedGoods: 1 });
tripSchema.index({ createdAt: -1 });

// Virtual for route summary
tripSchema.virtual("routeSummary").get(function () {
  return `${this.route.departure.city} → ${this.route.destination.city}`;
});

// Virtual for available capacity percentage
tripSchema.virtual("capacityUsagePercent").get(function () {
  const usedWeight =
    this.capacity.maxWeight -
    (this.capacity.availableWeight || this.capacity.maxWeight);
  return Math.round((usedWeight / this.capacity.maxWeight) * 100);
});

// Virtual for time until departure
tripSchema.virtual("timeUntilDeparture").get(function () {
  const now = new Date();
  const departure = new Date(this.schedule.departureDate);
  return departure - now;
});

// Pre-save middleware
tripSchema.pre("save", function (next) {
  // Set available capacity if not set
  if (!this.capacity.availableWeight) {
    this.capacity.availableWeight = this.capacity.maxWeight;
  }
  if (!this.capacity.availableVolume && this.capacity.maxVolume) {
    this.capacity.availableVolume = this.capacity.maxVolume;
  }

  // Set estimated arrival if not set
  if (!this.schedule.estimatedArrival && this.route.estimatedDuration) {
    const departure = new Date(this.schedule.departureDate);
    const [hours, minutes] = this.schedule.departureTime.split(":");
    departure.setHours(parseInt(hours), parseInt(minutes));
    this.schedule.estimatedArrival = new Date(
      departure.getTime() + this.route.estimatedDuration * 60 * 1000,
    );
  }

  next();
});

// Method to check if trip can accept more cargo
tripSchema.methods.canAcceptCargo = function (weight, volume = 0) {
  return (
    this.capacity.availableWeight >= weight &&
    (!this.capacity.availableVolume || this.capacity.availableVolume >= volume)
  );
};

// Method to reserve capacity
tripSchema.methods.reserveCapacity = function (weight, volume = 0) {
  if (!this.canAcceptCargo(weight, volume)) {
    throw new Error("Capacité insuffisante");
  }

  this.capacity.availableWeight -= weight;
  if (this.capacity.availableVolume) {
    this.capacity.availableVolume -= volume;
  }

  return this.save();
};

// Method to release capacity
tripSchema.methods.releaseCapacity = function (weight, volume = 0) {
  this.capacity.availableWeight = Math.min(
    this.capacity.availableWeight + weight,
    this.capacity.maxWeight,
  );

  if (this.capacity.availableVolume) {
    this.capacity.availableVolume = Math.min(
      this.capacity.availableVolume + volume,
      this.capacity.maxVolume || Infinity,
    );
  }

  return this.save();
};

// Static method to find trips by route
tripSchema.statics.findByRoute = function (
  departureCity,
  destinationCity,
  departureDate,
) {
  const query = {
    "route.departure.city": new RegExp(departureCity, "i"),
    "route.destination.city": new RegExp(destinationCity, "i"),
    status: "published",
  };

  if (departureDate) {
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate);
    endOfDay.setHours(23, 59, 59, 999);

    query["schedule.departureDate"] = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  return this.find(query)
    .populate("driver", "firstName lastName rating avatar")
    .sort({ "schedule.departureDate": 1 });
};

module.exports = mongoose.model("Trip", tripSchema);
