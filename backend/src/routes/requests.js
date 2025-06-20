const express = require("express");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Placeholder routes for requests
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Get requests endpoint - Coming soon",
    data: [],
  });
});

router.post("/", authorize("shipper"), (req, res) => {
  res.json({
    success: true,
    message: "Create request endpoint - Coming soon",
  });
});

router.get("/:id", (req, res) => {
  res.json({
    success: true,
    message: "Get request details endpoint - Coming soon",
  });
});

router.put("/:id/accept", authorize("driver"), (req, res) => {
  res.json({
    success: true,
    message: "Accept request endpoint - Coming soon",
  });
});

router.put("/:id/reject", authorize("driver"), (req, res) => {
  res.json({
    success: true,
    message: "Reject request endpoint - Coming soon",
  });
});

module.exports = router;
