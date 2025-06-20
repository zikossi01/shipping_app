const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Placeholder routes for notifications
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Get notifications endpoint - Coming soon",
    data: [],
  });
});

router.put("/:id/read", (req, res) => {
  res.json({
    success: true,
    message: "Mark notification as read endpoint - Coming soon",
  });
});

router.put("/mark-all-read", (req, res) => {
  res.json({
    success: true,
    message: "Mark all notifications as read endpoint - Coming soon",
  });
});

module.exports = router;
