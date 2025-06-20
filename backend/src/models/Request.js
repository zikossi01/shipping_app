const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'expéditeur est requis"],
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: [true, "Le trajet est requis"],
    },

    // Package information
    package: {
      description: {
        type: String,
        required: [true, "La description du colis est requise"],
        maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
      },

      type: {
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
        required: [true, "Le type de colis est requis"],
      },

      dimensions: {
        weight: {
          type: Number,
          required: [true, "Le poids est requis"],
          min: [0.1, "Le poids doit être positif"],
        },
        length: Number, // in cm
        width: Number, // in cm
        height: Number, // in cm
        volume: Number, // in m³ (calculated or provided)
      },

      value: {
        amount: Number,
        currency: {
          type: String,
          default: "EUR",
        },
        insured: {
          type: Boolean,
          default: false,
        },
      },

      specialHandling: [
        {
          type: String,
          enum: [
            "fragile",
            "this-way-up",
            "keep-dry",
            "temperature-sensitive",
            "valuable",
            "urgent",
            "personal-delivery-only",
          ],
        },
      ],

      photos: [String], // URLs to package photos
    },

    // Pickup and delivery details
    pickup: {
      address: {
        type: String,
        required: [true, "L'adresse de ramassage est requise"],
      },
      city: {
        type: String,
        required: [true, "La ville de ramassage est requise"],
      },
      postalCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      contactPerson: {
        name: String,
        phone: String,
        notes: String,
      },
      availabilityWindow: {
        start: Date,
        end: Date,
        flexible: {
          type: Boolean,
          default: false,
        },
      },
      accessInstructions: String,
    },

    delivery: {
      address: {
        type: String,
        required: [true, "L'adresse de livraison est requise"],
      },
      city: {
        type: String,
        required: [true, "La ville de livraison est requise"],
      },
      postalCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      contactPerson: {
        name: String,
        phone: String,
        notes: String,
      },
      availabilityWindow: {
        start: Date,
        end: Date,
        flexible: {
          type: Boolean,
          default: false,
        },
      },
      accessInstructions: String,
    },

    // Pricing and payment
    pricing: {
      offeredPrice: {
        type: Number,
        required: [true, "Le prix proposé est requis"],
        min: [0, "Le prix ne peut pas être négatif"],
      },
      negotiatedPrice: Number,
      finalPrice: Number,
      currency: {
        type: String,
        default: "EUR",
      },
      paymentMethod: {
        type: String,
        enum: ["cash", "card", "bank-transfer", "paypal", "platform"],
        default: "platform",
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded", "disputed"],
        default: "pending",
      },
    },

    // Request status and workflow
    status: {
      type: String,
      enum: [
        "pending", // Waiting for driver response
        "accepted", // Accepted by driver
        "rejected", // Rejected by driver
        "pickup-ready", // Ready for pickup
        "in-transit", // Package picked up and in transit
        "delivered", // Successfully delivered
        "cancelled", // Cancelled by shipper
        "disputed", // Dispute raised
      ],
      default: "pending",
    },

    // Communication and messages
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    lastMessageAt: Date,

    // Timeline tracking
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        location: {
          latitude: Number,
          longitude: Number,
          address: String,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Proof of delivery
    delivery_proof: {
      photos: [String],
      signature: String, // Base64 encoded signature
      deliveredAt: Date,
      deliveredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      receivedBy: {
        name: String,
        relationship: String, // 'recipient', 'neighbor', 'concierge', etc.
      },
      notes: String,
    },

    // Special requirements
    requirements: {
      insuranceRequired: {
        type: Boolean,
        default: false,
      },
      signatureRequired: {
        type: Boolean,
        default: true,
      },
      photoProofRequired: {
        type: Boolean,
        default: false,
      },
      trackingRequired: {
        type: Boolean,
        default: true,
      },
    },

    // Reviews (after completion)
    reviews: {
      shipperReview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
      driverReview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    },

    // Dispute information
    dispute: {
      reason: String,
      description: String,
      raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      raisedAt: Date,
      status: {
        type: String,
        enum: ["open", "investigating", "resolved", "escalated"],
      },
      resolution: String,
      resolvedAt: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Emergency contacts
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    // Special instructions
    specialInstructions: {
      type: String,
      maxlength: [
        1000,
        "Les instructions ne peuvent pas dépasser 1000 caractères",
      ],
    },

    // Admin fields
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
requestSchema.index({ shipper: 1 });
requestSchema.index({ trip: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ "pickup.city": 1, "delivery.city": 1 });

// Virtual for total distance
requestSchema.virtual("estimatedDistance").get(function () {
  if (this.pickup.coordinates && this.delivery.coordinates) {
    // Calculate distance using coordinates (simplified)
    const lat1 = this.pickup.coordinates.latitude;
    const lon1 = this.pickup.coordinates.longitude;
    const lat2 = this.delivery.coordinates.latitude;
    const lon2 = this.delivery.coordinates.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }
  return null;
});

// Virtual for package volume
requestSchema.virtual("calculatedVolume").get(function () {
  if (
    this.package.dimensions.length &&
    this.package.dimensions.width &&
    this.package.dimensions.height
  ) {
    return (
      (this.package.dimensions.length *
        this.package.dimensions.width *
        this.package.dimensions.height) /
      1000000
    ); // cm³ to m³
  }
  return this.package.dimensions.volume || 0;
});

// Pre-save middleware
requestSchema.pre("save", function (next) {
  // Calculate volume if dimensions are provided
  if (
    this.package.dimensions.length &&
    this.package.dimensions.width &&
    this.package.dimensions.height &&
    !this.package.dimensions.volume
  ) {
    this.package.dimensions.volume = this.calculatedVolume;
  }

  // Add timeline entry for status changes
  if (this.isModified("status")) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this._updatedBy, // Set this before saving
    });
  }

  next();
});

// Method to update status with timeline
requestSchema.methods.updateStatus = function (
  newStatus,
  updatedBy,
  note = "",
  location = null,
) {
  this.status = newStatus;
  this._updatedBy = updatedBy;

  const timelineEntry = {
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    note: note,
  };

  if (location) {
    timelineEntry.location = location;
  }

  this.timeline.push(timelineEntry);
  return this.save();
};

// Method to check if request can be cancelled
requestSchema.methods.canBeCancelled = function () {
  return ["pending", "accepted", "pickup-ready"].includes(this.status);
};

// Method to check if request is active
requestSchema.methods.isActive = function () {
  return ["accepted", "pickup-ready", "in-transit"].includes(this.status);
};

// Static method to find requests by location
requestSchema.statics.findByRoute = function (pickupCity, deliveryCity) {
  return this.find({
    "pickup.city": new RegExp(pickupCity, "i"),
    "delivery.city": new RegExp(deliveryCity, "i"),
    status: { $in: ["pending"] },
  })
    .populate("shipper", "firstName lastName rating avatar")
    .populate("trip", "route schedule pricing")
    .sort({ createdAt: -1 });
};

// Static method to get statistics
requestSchema.statics.getStatistics = function (dateRange = null) {
  const matchStage = dateRange
    ? {
        createdAt: {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end),
        },
      }
    : {};

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalValue: { $sum: "$pricing.finalPrice" },
      },
    },
  ]);
};

module.exports = mongoose.model("Request", requestSchema);
