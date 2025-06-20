const colors = require("colors");

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.log(err.stack.red);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Ressource non trouvée";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = "Ressource déjà existante";

    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    if (field === "email") {
      message = "Un compte avec cet email existe déjà";
    } else if (field === "phone") {
      message = "Un compte avec ce numéro de téléphone existe déjà";
    } else if (field === "licenseNumber") {
      message = "Ce numéro de permis est déj�� enregistré";
    }

    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Token d'accès invalide";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token d'accès expiré";
    error = { message, statusCode: 401 };
  }

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "Fichier trop volumineux";
    error = { message, statusCode: 400 };
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Type de fichier non autorisé";
    error = { message, statusCode: 400 };
  }

  // MongoDB connection errors
  if (err.name === "MongoNetworkError") {
    const message = "Erreur de connexion à la base de données";
    error = { message, statusCode: 500 };
  }

  if (err.name === "MongoServerError") {
    const message = "Erreur de base de données";
    error = { message, statusCode: 500 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = "Trop de requêtes, veuillez réessayer plus tard";
    error = { message, statusCode: 429 };
  }

  // CORS errors
  if (err.message && err.message.includes("CORS")) {
    const message = "Accès non autorisé depuis cette origine";
    error = { message, statusCode: 403 };
  }

  // Payment errors (Stripe, etc.)
  if (err.type === "StripeCardError") {
    const message = "Erreur de paiement: " + err.message;
    error = { message, statusCode: 400 };
  }

  // External API errors
  if (err.response && err.response.status) {
    const message = "Erreur de service externe";
    error = { message, statusCode: 502 };
  }

  // Custom application errors
  if (err.name === "AppError") {
    error = { message: err.message, statusCode: err.statusCode || 500 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || "Erreur serveur interne";

  // Additional error details for development
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
      details: {
        name: err.name,
        code: err.code,
        statusCode: statusCode,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    }),
  };

  // Log error for monitoring
  logError(err, req, statusCode);

  res.status(statusCode).json(errorResponse);
};

// Custom error logger
const logError = (err, req, statusCode) => {
  const logData = {
    timestamp: new Date().toISOString(),
    level: statusCode >= 500 ? "ERROR" : "WARN",
    message: err.message,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user ? req.user._id : null,
    stack: err.stack,
  };

  // In production, send to logging service (e.g., Winston, Sentry)
  if (process.env.NODE_ENV === "production") {
    // Example: Send to external logging service
    // logger.error(logData);
    console.error(JSON.stringify(logData));
  } else {
    // Development logging
    console.error(`
${colors.red.bold("=== ERROR ===")}
${colors.yellow("Time:")} ${logData.timestamp}
${colors.yellow("Level:")} ${logData.level}
${colors.yellow("Status:")} ${statusCode}
${colors.yellow("Method:")} ${req.method}
${colors.yellow("URL:")} ${req.url}
${colors.yellow("IP:")} ${req.ip}
${colors.yellow("User:")} ${logData.userId || "Anonymous"}
${colors.yellow("Message:")} ${err.message}
${colors.yellow("Stack:")} ${err.stack}
${colors.red.bold("=============")}`);
  }
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route non trouvée - ${req.originalUrl}`, 404);
  next(error);
};

// Unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled Promise Rejection: ${err.message}`.red.bold);
  // Close server & exit process
  // server.close(() => {
  //   process.exit(1);
  // });
});

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`.red.bold);
  console.log("Shutting down...");
  process.exit(1);
});

module.exports = {
  errorHandler,
  AppError,
  asyncHandler,
  notFound,
  logError,
};
