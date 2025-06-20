const Trip = require("../models/Trip");
const User = require("../models/User");
const Request = require("../models/Request");

// @desc    Get all trips with filtering and pagination
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  try {
    // Build query
    let query = Trip.find({ status: "published" });

    // Filtering
    if (req.query.departureCity) {
      query = query
        .where("route.departure.city")
        .regex(new RegExp(req.query.departureCity, "i"));
    }

    if (req.query.destinationCity) {
      query = query
        .where("route.destination.city")
        .regex(new RegExp(req.query.destinationCity, "i"));
    }

    if (req.query.departureDate) {
      const startOfDay = new Date(req.query.departureDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(req.query.departureDate);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .where("schedule.departureDate")
        .gte(startOfDay)
        .lte(endOfDay);
    }

    if (req.query.maxWeight) {
      query = query
        .where("capacity.availableWeight")
        .gte(parseInt(req.query.maxWeight));
    }

    if (req.query.allowedGoods) {
      query = query.where("allowedGoods").in([req.query.allowedGoods]);
    }

    if (req.query.maxPrice) {
      query = query
        .where("pricing.basePrice")
        .lte(parseInt(req.query.maxPrice));
    }

    // Sorting
    let sortBy = "-createdAt"; // Default sort
    if (req.query.sortBy) {
      const sortOptions = {
        "price-asc": "pricing.basePrice",
        "price-desc": "-pricing.basePrice",
        "date-asc": "schedule.departureDate",
        "date-desc": "-schedule.departureDate",
        "rating-desc": "-driver.rating.average",
        newest: "-createdAt",
        oldest: "createdAt",
      };
      sortBy = sortOptions[req.query.sortBy] || sortBy;
    }

    query = query.sort(sortBy);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    query = query.skip(startIndex).limit(limit);

    // Population
    query = query.populate({
      path: "driver",
      select:
        "firstName lastName rating avatar isVerified driverInfo.completedTrips",
    });

    // Execute query
    const trips = await query;

    // Get total count for pagination
    const total = await Trip.countDocuments({
      status: "published",
      ...(req.query.departureCity && {
        "route.departure.city": new RegExp(req.query.departureCity, "i"),
      }),
      ...(req.query.destinationCity && {
        "route.destination.city": new RegExp(req.query.destinationCity, "i"),
      }),
    });

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      data: trips,
    });
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des trajets",
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate({
        path: "driver",
        select:
          "firstName lastName rating avatar isVerified driverInfo phone address",
      })
      .populate({
        path: "requests",
        populate: {
          path: "shipper",
          select: "firstName lastName rating avatar",
        },
      });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé",
      });
    }

    // Increment views count
    await Trip.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error("Get trip error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du trajet",
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private (Driver only)
exports.createTrip = async (req, res) => {
  try {
    // Check if user is a driver
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Seuls les conducteurs peuvent créer des trajets",
      });
    }

    // Check if driver is verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Votre compte doit être vérifié pour créer des trajets",
      });
    }

    // Add driver to trip data
    req.body.driver = req.user.id;

    // Get driver's vehicle info if not provided
    if (!req.body.vehicle && req.user.driverInfo?.vehicleInfo) {
      req.body.vehicle = {
        type: req.user.driverInfo.vehicleInfo.type,
        licensePlate: req.user.driverInfo.vehicleInfo.licensePlate,
      };
    }

    const trip = await Trip.create(req.body);

    // Populate driver info
    await trip.populate({
      path: "driver",
      select: "firstName lastName rating avatar",
    });

    res.status(201).json({
      success: true,
      message: "Trajet créé avec succès",
      data: trip,
    });
  } catch (error) {
    console.error("Create trip error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du trajet",
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (Driver only - own trips)
exports.updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé",
      });
    }

    // Check if user owns the trip
    if (trip.driver.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier ce trajet",
      });
    }

    // Don't allow updating if trip is in progress or completed
    if (["in-progress", "completed"].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        message: "Impossible de modifier un trajet en cours ou terminé",
      });
    }

    // Remove fields that shouldn't be updated
    delete req.body.driver;
    delete req.body.requests;
    delete req.body.acceptedRequests;

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: "driver",
      select: "firstName lastName rating avatar",
    });

    res.status(200).json({
      success: true,
      message: "Trajet mis à jour avec succès",
      data: trip,
    });
  } catch (error) {
    console.error("Update trip error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du trajet",
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Driver only - own trips)
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé",
      });
    }

    // Check if user owns the trip
    if (trip.driver.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à supprimer ce trajet",
      });
    }

    // Check if trip has accepted requests
    if (trip.acceptedRequests && trip.acceptedRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Impossible de supprimer un trajet avec des demandes acceptées",
      });
    }

    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: "Trajet supprimé avec succès",
    });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du trajet",
    });
  }
};

// @desc    Get driver's trips
// @route   GET /api/trips/driver/me
// @access  Private (Driver only)
exports.getMyTrips = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Accès réservé aux conducteurs",
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { driver: req.user.id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: "requests",
        populate: {
          path: "shipper",
          select: "firstName lastName rating avatar",
        },
      });

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      data: trips,
    });
  } catch (error) {
    console.error("Get my trips error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de vos trajets",
    });
  }
};

// @desc    Publish trip
// @route   PUT /api/trips/:id/publish
// @access  Private (Driver only - own trips)
exports.publishTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé",
      });
    }

    // Check if user owns the trip
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    if (trip.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Seuls les brouillons peuvent être publiés",
      });
    }

    trip.status = "published";
    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trajet publié avec succès",
      data: trip,
    });
  } catch (error) {
    console.error("Publish trip error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la publication du trajet",
    });
  }
};

// @desc    Start trip
// @route   PUT /api/trips/:id/start
// @access  Private (Driver only - own trips)
exports.startTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé",
      });
    }

    // Check if user owns the trip
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    if (trip.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Le trajet doit être publié pour être démarré",
      });
    }

    trip.status = "in-progress";
    trip.completion.actualDepartureTime = new Date();
    await trip.save();

    // Update related requests status
    await Request.updateMany(
      { trip: trip._id, status: "accepted" },
      { status: "in-transit" },
    );

    res.status(200).json({
      success: true,
      message: "Trajet démarré avec succès",
      data: trip,
    });
  } catch (error) {
    console.error("Start trip error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du démarrage du trajet",
    });
  }
};

// @desc    Complete trip
// @route   PUT /api/trips/:id/complete
// @access  Private (Driver only - own trips)
exports.completeTrip = async (req, res) => {
  try {
    const { actualDistance, fuelCost, tollCost, notes } = req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé",
      });
    }

    // Check if user owns the trip
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    if (trip.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Le trajet doit être en cours pour être terminé",
      });
    }

    // Update trip completion info
    trip.status = "completed";
    trip.completion.actualArrivalTime = new Date();
    trip.completion.actualDistance = actualDistance;
    trip.completion.fuelCost = fuelCost;
    trip.completion.tollCost = tollCost;
    trip.completion.notes = notes;

    // Calculate actual duration
    if (trip.completion.actualDepartureTime) {
      const duration =
        (trip.completion.actualArrivalTime -
          trip.completion.actualDepartureTime) /
        (1000 * 60); // minutes
      trip.completion.actualDuration = Math.round(duration);
    }

    // Calculate total earnings from accepted requests
    const acceptedRequests = await Request.find({
      trip: trip._id,
      status: { $in: ["delivered", "in-transit"] },
    });

    const totalEarnings = acceptedRequests.reduce((sum, request) => {
      return (
        sum +
        (request.pricing.finalPrice ||
          request.pricing.negotiatedPrice ||
          request.pricing.offeredPrice)
      );
    }, 0);

    trip.completion.totalEarnings = totalEarnings;

    await trip.save();

    // Update driver statistics
    await User.findByIdAndUpdate(trip.driver, {
      $inc: {
        "driverInfo.completedTrips": 1,
        "driverInfo.totalEarnings": totalEarnings,
      },
    });

    res.status(200).json({
      success: true,
      message: "Trajet terminé avec succès",
      data: trip,
    });
  } catch (error) {
    console.error("Complete trip error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la finalisation du trajet",
    });
  }
};

// @desc    Search trips
// @route   GET /api/trips/search
// @access  Public
exports.searchTrips = async (req, res) => {
  try {
    const { from, to, date, weight, goodsType } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Les villes de départ et d'arrivée sont requises",
      });
    }

    const trips = await Trip.findByRoute(from, to, date)
      .where("capacity.availableWeight")
      .gte(weight || 0)
      .where(goodsType ? "allowedGoods" : {})
      .in(goodsType ? [goodsType] : [])
      .limit(20);

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Search trips error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche de trajets",
    });
  }
};
