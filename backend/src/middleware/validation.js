const { body, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Données invalides",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Validation rules
const validationRules = {
  register: [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Le prénom doit contenir entre 2 et 50 caractères")
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage("Le prénom ne peut contenir que des lettres"),

    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Le nom doit contenir entre 2 et 50 caractères")
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage("Le nom ne peut contenir que des lettres"),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Veuillez entrer un email valide"),

    body("phone")
      .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
      .withMessage("Veuillez entrer un numéro de téléphone français valide"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caractères")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
      ),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Les mots de passe ne correspondent pas");
      }
      return true;
    }),

    body("role")
      .isIn(["driver", "shipper", "admin"])
      .withMessage("Rôle invalide"),
  ],

  login: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Veuillez entrer un email valide"),

    body("password").notEmpty().withMessage("Le mot de passe est requis"),
  ],

  updateDetails: [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Le prénom doit contenir entre 2 et 50 caractères"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Le nom doit contenir entre 2 et 50 caractères"),

    body("phone")
      .optional()
      .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
      .withMessage("Veuillez entrer un numéro de téléphone français valide"),
  ],

  updatePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Le mot de passe actuel est requis"),

    body("newPassword")
      .isLength({ min: 6 })
      .withMessage(
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      )
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
      ),

    body("confirmNewPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Les nouveaux mots de passe ne correspondent pas");
      }
      return true;
    }),
  ],

  forgotPassword: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Veuillez entrer un email valide"),
  ],

  resetPassword: [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caractères")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
      ),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Les mots de passe ne correspondent pas");
      }
      return true;
    }),
  ],

  refreshToken: [
    body("refreshToken").notEmpty().withMessage("Le refresh token est requis"),
  ],

  createTrip: [
    body("route.departure.address")
      .trim()
      .notEmpty()
      .withMessage("L'adresse de départ est requise"),

    body("route.departure.city")
      .trim()
      .notEmpty()
      .withMessage("La ville de départ est requise"),

    body("route.destination.address")
      .trim()
      .notEmpty()
      .withMessage("L'adresse de destination est requise"),

    body("route.destination.city")
      .trim()
      .notEmpty()
      .withMessage("La ville de destination est requise"),

    body("schedule.departureDate")
      .isISO8601()
      .withMessage("Date de départ invalide")
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error("La date de départ doit être dans le futur");
        }
        return true;
      }),

    body("schedule.departureTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Format d'heure invalide (HH:MM)"),

    body("capacity.maxWeight")
      .isFloat({ min: 1 })
      .withMessage("Le poids maximum doit être positif"),

    body("pricing.basePrice")
      .isFloat({ min: 0 })
      .withMessage("Le prix de base ne peut pas être négatif"),

    body("vehicle.type")
      .isIn(["van", "truck", "semi-truck", "other"])
      .withMessage("Type de véhicule invalide"),
  ],

  createRequest: [
    body("trip").isMongoId().withMessage("ID de trajet invalide"),

    body("package.description")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("La description doit contenir entre 10 et 500 caractères"),

    body("package.type")
      .isIn([
        "general",
        "fragile",
        "furniture",
        "electronics",
        "food",
        "clothing",
        "books",
        "automotive",
        "garden",
        "sports",
        "medical",
        "industrial",
        "art",
        "other",
      ])
      .withMessage("Type de colis invalide"),

    body("package.dimensions.weight")
      .isFloat({ min: 0.1 })
      .withMessage("Le poids doit être positif"),

    body("pickup.address")
      .trim()
      .notEmpty()
      .withMessage("L'adresse de ramassage est requise"),

    body("pickup.city")
      .trim()
      .notEmpty()
      .withMessage("La ville de ramassage est requise"),

    body("delivery.address")
      .trim()
      .notEmpty()
      .withMessage("L'adresse de livraison est requise"),

    body("delivery.city")
      .trim()
      .notEmpty()
      .withMessage("La ville de livraison est requise"),

    body("pricing.offeredPrice")
      .isFloat({ min: 0 })
      .withMessage("Le prix proposé ne peut pas être négatif"),
  ],

  createReview: [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("La note doit être entre 1 et 5"),

    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Le commentaire ne peut pas dépasser 1000 caractères"),

    body("request").isMongoId().withMessage("ID de demande invalide"),
  ],
};

// Middleware factory
const validateInput = (ruleName) => {
  return [...validationRules[ruleName], handleValidationErrors];
};

module.exports = {
  validateInput,
  validationRules,
  handleValidationErrors,
};
