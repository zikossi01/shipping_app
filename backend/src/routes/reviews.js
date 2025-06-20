const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Placeholder routes for reviews
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Get reviews endpoint - Coming soon",
    data: [],
  });
});

router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Create review endpoint - Coming soon",
  });
});

router.get("/user/:id", (req, res) => {
  res.json({
    success: true,
    message: "Get user reviews endpoint - Coming soon",
    data: [],
  });
});

module.exports = router;
