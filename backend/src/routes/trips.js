const express = require("express");
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getMyTrips,
  publishTrip,
  startTrip,
  completeTrip,
  searchTrips,
} = require("../controllers/tripController");

const {
  protect,
  authorize,
  requireVerification,
} = require("../middleware/auth");
const { validateInput } = require("../middleware/validation");

const router = express.Router();

// Public routes
router.get("/", getTrips);
router.get("/search", searchTrips);
router.get("/:id", getTrip);

// Protected routes
router.use(protect); // All routes after this middleware are protected

// Driver only routes
router.get("/driver/me", authorize("driver"), requireVerification, getMyTrips);

router.post(
  "/",
  authorize("driver"),
  requireVerification,
  validateInput("createTrip"),
  createTrip,
);

router.put(
  "/:id",
  authorize("driver", "admin"),
  validateInput("createTrip"),
  updateTrip,
);

router.delete("/:id", authorize("driver", "admin"), deleteTrip);

router.put("/:id/publish", authorize("driver"), publishTrip);

router.put("/:id/start", authorize("driver"), startTrip);

router.put("/:id/complete", authorize("driver"), completeTrip);

module.exports = router;
