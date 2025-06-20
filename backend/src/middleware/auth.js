const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé, token requis",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Check if user account is active
      if (user.status === "suspended") {
        return res.status(403).json({
          success: false,
          message: "Compte suspendu",
        });
      }

      // Check if user account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: "Compte temporairement verrouillé",
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expiré",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Token invalide",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Token non autorisé",
        });
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur d'authentification",
    });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rôle ${req.user.role} non autorisé pour cette action`,
      });
    }

    next();
  };
};

// Check if user is verified
exports.requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Accès non autorisé",
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Compte non vérifié. Veuillez compléter la vérification de votre compte.",
    });
  }

  next();
};

// Check if email is verified
exports.requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Accès non autorisé",
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email non vérifié. Veuillez vérifier votre adresse email.",
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id);

      if (user && user.status === "active") {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
};

// Rate limiting for sensitive operations
exports.rateLimitSensitive = (req, res, next) => {
  // This would typically use Redis or similar for production
  // For now, we'll implement a simple in-memory rate limiter

  const key = req.ip + ":" + req.path;
  const now = Date.now();
  const windowSize = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // This should be stored in Redis in production
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const attempts = global.rateLimitStore.get(key) || [];

  // Remove expired attempts
  const validAttempts = attempts.filter((time) => now - time < windowSize);

  if (validAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: "Trop de tentatives. Veuillez réessayer plus tard.",
      retryAfter: Math.ceil((validAttempts[0] + windowSize - now) / 1000),
    });
  }

  // Add current attempt
  validAttempts.push(now);
  global.rateLimitStore.set(key, validAttempts);

  next();
};

// Admin level authorization
exports.requireAdminLevel = (minLevel) => {
  const levels = { support: 1, moderator: 2, super: 3 };

  return (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Accès administrateur requis",
      });
    }

    const userLevel = levels[req.user.adminLevel] || 0;
    const requiredLevel = levels[minLevel] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: "Niveau d'autorisation insuffisant",
      });
    }

    next();
  };
};

// Check resource ownership
exports.checkOwnership = (Model, userField = "user") => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Ressource non trouvée",
        });
      }

      // Allow admins to access any resource
      if (req.user.role === "admin") {
        req.resource = resource;
        return next();
      }

      // Check ownership
      const resourceUserId = resource[userField];
      const currentUserId = req.user._id;

      if (resourceUserId.toString() !== currentUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à cette ressource",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification des droits",
      });
    }
  };
};

// Middleware to log authentication events
exports.logAuthEvent = (event) => {
  return (req, res, next) => {
    const logData = {
      event,
      userId: req.user ? req.user._id : null,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date(),
      path: req.path,
      method: req.method,
    };

    // In production, this should be sent to a proper logging service
    console.log("Auth Event:", JSON.stringify(logData));

    // Store in database for security monitoring
    // AuthLog.create(logData).catch(console.error);

    next();
  };
};

// Security headers middleware
exports.securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict transport security (HTTPS only)
  if (req.secure) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  // Content security policy
  res.setHeader("Content-Security-Policy", "default-src 'self'");

  next();
};

module.exports = exports;
