const express = require("express");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Basic user routes (placeholder for now)
router.get("/profile", (req, res) => {
  res.json({
    success: true,
    message: "User profile endpoint - Coming soon",
    data: req.user,
  });
});

router.put("/profile", (req, res) => {
  res.json({
    success: true,
    message: "Update profile endpoint - Coming soon",
  });
});

module.exports = router;
