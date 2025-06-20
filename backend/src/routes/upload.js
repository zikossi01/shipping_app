const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Placeholder routes for file upload
router.post("/image", (req, res) => {
  res.json({
    success: true,
    message: "Image upload endpoint - Coming soon",
    data: {
      url: "https://example.com/placeholder-image.jpg",
    },
  });
});

router.post("/document", (req, res) => {
  res.json({
    success: true,
    message: "Document upload endpoint - Coming soon",
    data: {
      url: "https://example.com/placeholder-document.pdf",
    },
  });
});

router.delete("/:fileId", (req, res) => {
  res.json({
    success: true,
    message: "Delete file endpoint - Coming soon",
  });
});

module.exports = router;
