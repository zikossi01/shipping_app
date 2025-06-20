const express = require("express");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize("admin"));

// Placeholder routes for admin
router.get("/dashboard", (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard endpoint - Coming soon",
    data: {
      stats: {
        totalUsers: 1250,
        activeTrips: 45,
        completedTrips: 890,
        totalRevenue: 25400,
      },
    },
  });
});

router.get("/users", (req, res) => {
  res.json({
    success: true,
    message: "Admin users management endpoint - Coming soon",
    data: [],
  });
});

router.put("/users/:id/verify", (req, res) => {
  res.json({
    success: true,
    message: "Verify user endpoint - Coming soon",
  });
});

router.put("/users/:id/suspend", (req, res) => {
  res.json({
    success: true,
    message: "Suspend user endpoint - Coming soon",
  });
});

router.get("/analytics", (req, res) => {
  res.json({
    success: true,
    message: "Admin analytics endpoint - Coming soon",
    data: [],
  });
});

module.exports = router;
