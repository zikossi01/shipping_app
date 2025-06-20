const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
} = require("../controllers/authController");

const {
  protect,
  rateLimitSensitive,
  logAuthEvent,
} = require("../middleware/auth");
const { validateInput } = require("../middleware/validation");

const router = express.Router();

// Public routes
router.post(
  "/register",
  rateLimitSensitive,
  validateInput("register"),
  logAuthEvent("register_attempt"),
  register,
);

router.post(
  "/login",
  rateLimitSensitive,
  validateInput("login"),
  logAuthEvent("login_attempt"),
  login,
);

router.post(
  "/forgot-password",
  rateLimitSensitive,
  validateInput("forgotPassword"),
  logAuthEvent("forgot_password_attempt"),
  forgotPassword,
);

router.put(
  "/reset-password/:resettoken",
  rateLimitSensitive,
  validateInput("resetPassword"),
  logAuthEvent("password_reset_attempt"),
  resetPassword,
);

router.get("/verify-email/:token", verifyEmail);

router.post("/refresh", validateInput("refreshToken"), refreshToken);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post("/logout", logAuthEvent("logout"), logout);

router.get("/me", getMe);

router.put(
  "/update-details",
  validateInput("updateDetails"),
  logAuthEvent("profile_update"),
  updateDetails,
);

router.put(
  "/update-password",
  rateLimitSensitive,
  validateInput("updatePassword"),
  logAuthEvent("password_change"),
  updatePassword,
);

module.exports = router;
