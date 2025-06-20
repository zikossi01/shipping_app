const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
      maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
    },
    lastName: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez entrer un email valide",
      ],
    },
    phone: {
      type: String,
      required: [true, "Le téléphone est requis"],
      match: [
        /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
        "Veuillez entrer un numéro de téléphone français valide",
      ],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
      select: false,
    },
    role: {
      type: String,
      enum: ["driver", "shipper", "admin"],
      required: [true, "Le rôle est requis"],
    },

    // Verification and status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpires: Date,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
    },

    // Profile information
    avatar: {
      type: String,
      default: null,
    },

    // Driver specific fields
    driverInfo: {
      licenseNumber: {
        type: String,
        required: function () {
          return this.role === "driver";
        },
      },
      licenseExpiry: {
        type: Date,
        required: function () {
          return this.role === "driver";
        },
      },
      vehicleInfo: {
        type: {
          type: String,
          enum: ["van", "truck", "semi-truck", "other"],
        },
        brand: String,
        model: String,
        year: Number,
        licensePlate: String,
        maxWeight: Number, // in kg
        maxVolume: Number, // in m³
        insuranceNumber: String,
        insuranceExpiry: Date,
      },
      completedTrips: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
    },

    // Shipper specific fields
    shipperInfo: {
      companyName: String,
      siretNumber: String,
      totalShipments: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
    },

    // Rating system
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Address
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: {
        type: String,
        default: "France",
      },
    },

    // Preferences
    preferences: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
      language: {
        type: String,
        default: "fr",
        enum: ["fr", "en"],
      },
    },

    // Security
    lastLogin: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    // Admin specific
    adminLevel: {
      type: String,
      enum: ["super", "moderator", "support"],
      required: function () {
        return this.role === "admin";
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ "driverInfo.licenseNumber": 1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Method to update rating
userSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
