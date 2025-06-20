const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const { verifyRefreshToken } = require("../utils/jwt");

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res, message = "Succès") => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      role,
    } = req.body;

    // Validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Les mots de passe ne correspondent pas",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      const verifyURL = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;

      await sendEmail({
        email: user.email,
        subject: "Vérification de votre compte TransportConnect",
        template: "emailVerification",
        data: {
          name: user.firstName,
          verifyURL,
        },
      });

      createSendToken(
        user,
        201,
        res,
        "Inscription réussie. Veuillez vérifier votre email.",
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi de l'email de vérification",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);

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
      message: "Erreur serveur lors de l'inscription",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un email et un mot de passe",
      });
    }

    // Check for user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message:
          "Compte temporairement verrouillé suite à plusieurs tentatives de connexion incorrectes",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Check if user is suspended
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Votre compte a été suspendu. Contactez le support.",
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res, "Connexion réussie");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Déconnexion réussie",
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      preferences: req.body.preferences,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: user,
    });
  } catch (error) {
    console.error("Update details error:", error);

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
      message: "Erreur lors de la mise à jour du profil",
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Les nouveaux mots de passe ne correspondent pas",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe actuel incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res, "Mot de passe mis à jour avec succès");
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du mot de passe",
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aucun utilisateur trouvé avec cette adresse email",
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get("host")}/api/auth/resetpassword/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Réinitialisation de mot de passe TransportConnect",
        template: "passwordReset",
        data: {
          name: user.firstName,
          resetURL,
        },
      });

      res.status(200).json({
        success: true,
        message: "Email de réinitialisation envoyé",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email non envoyé",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token invalide ou expiré",
      });
    }

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Les mots de passe ne correspondent pas",
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, res, "Mot de passe réinitialisé avec succès");
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe",
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // Get hashed token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token de vérification invalide ou expiré",
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.status = "active";
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Email vérifié avec succès",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de l'email",
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token requis",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    const newToken = signToken(user._id);

    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }
};
