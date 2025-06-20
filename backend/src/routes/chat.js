const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Placeholder routes for chat
router.get("/conversations", (req, res) => {
  res.json({
    success: true,
    message: "Get conversations endpoint - Coming soon",
    data: [],
  });
});

router.get("/:requestId", (req, res) => {
  res.json({
    success: true,
    message: "Get conversation messages endpoint - Coming soon",
    data: [],
  });
});

router.post("/:requestId", (req, res) => {
  res.json({
    success: true,
    message: "Send message endpoint - Coming soon",
  });
});

router.put("/mark-read", (req, res) => {
  res.json({
    success: true,
    message: "Mark messages as read endpoint - Coming soon",
  });
});

module.exports = router;
