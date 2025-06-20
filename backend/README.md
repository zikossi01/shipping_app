# TransportConnect Backend API

🚛 **Backend API pour la plateforme TransportConnect** - Solution complète de logistique collaborative multi-rôle en France.

## 🌟 Fonctionnalités

### 🔐 Authentification & Sécurité

- **JWT Authentication** avec refresh tokens
- **Rôles multi-utilisateurs** (Conducteur, Expéditeur, Administrateur)
- **Vérification email** et validation de compte
- **Réinitialisation de mot de passe** sécurisée
- **Rate limiting** et protection contre les attaques
- **Chiffrement bcrypt** des mots de passe

### 🚛 Gestion des Trajets

- **Création et publication** de trajets par les conducteurs
- **Recherche avancée** avec filtres géographiques
- **Gestion de capacité** (poids, volume, dimensions)
- **Tarification flexible** avec négociation
- **Statuts en temps réel** (brouillon, publié, en cours, terminé)

### 📦 Système de Demandes

- **Création de demandes** de transport par les expéditeurs
- **Matching intelligent** trajet-demande
- **Acceptation/refus** par les conducteurs
- **Suivi complet** du statut des colis
- **Preuve de livraison** avec photos et signature

### 💬 Messagerie Temps Réel

- **Chat en temps réel** via Socket.IO
- **Notifications push** instantanées
- **Indicateurs de frappe** et accusés de lecture
- **Partage de localisation** en temps réel
- **Historique des conversations**

### ⭐ Système d'Évaluations

- **Évaluations bidirectionnelles** (conducteur ↔ expéditeur)
- **Calcul automatique** des notes moyennes
- **Commentaires et retours** détaillés
- **Badge de confiance** basé sur les évaluations

### 📧 Notifications Multi-canaux

- **Emails automatiques** avec templates HTML
- **Notifications push** via Firebase
- **SMS** via Twilio (optionnel)
- **Notifications in-app** en temps réel

### 👨‍💼 Interface Administration

- **Dashboard complet** avec statistiques
- **Gestion des utilisateurs** et vérifications
- **Modération du contenu** et signalements
- **Analytiques avancées** avec graphiques
- **Gestion des litiges** et support

## 🏗️ Architecture Technique

```
📁 Backend Architecture
├── 🚀 Express.js Server
├── 🍃 MongoDB avec Mongoose
├── 🔌 Socket.IO pour temps réel
├── 📧 Nodemailer pour emails
├── ☁️ Cloudinary pour images
├── 🔄 Redis pour cache/sessions
├── 📊 APIs externes (Google Maps, etc.)
└── 🐳 Docker pour déploiement
```

## 🚀 Installation & Configuration

### Prérequis

```bash
Node.js >= 16.0.0
MongoDB >= 5.0
Redis >= 6.0 (optionnel)
```

### Installation

```bash
# Cloner le repository
git clone https://github.com/transportconnect/backend.git
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Démarrer en développement
npm run dev
```

### Docker (Recommandé)

```bash
# Démarrer avec Docker Compose
docker-compose up -d

# Services disponibles:
# - API Backend: http://localhost:5000
# - MongoDB: localhost:27017
# - Redis: localhost:6379
# - Mongo Express: http://localhost:8081
# - Redis Commander: http://localhost:8082
```

## 📚 API Endpoints

### 🔐 Authentification

```http
POST   /api/auth/register           # Inscription utilisateur
POST   /api/auth/login              # Connexion
POST   /api/auth/logout             # Déconnexion
GET    /api/auth/me                 # Profil utilisateur
PUT    /api/auth/update-details     # Mise à jour profil
PUT    /api/auth/update-password    # Changement mot de passe
POST   /api/auth/forgot-password    # Mot de passe oublié
PUT    /api/auth/reset-password/:token # Réinitialisation
GET    /api/auth/verify-email/:token  # Vérification email
```

### 🚛 Trajets

```http
GET    /api/trips                   # Liste des trajets
GET    /api/trips/:id               # Détail trajet
POST   /api/trips                   # Créer trajet (conducteur)
PUT    /api/trips/:id               # Modifier trajet
DELETE /api/trips/:id               # Supprimer trajet
GET    /api/trips/search            # Recherche trajets
GET    /api/trips/driver/me         # Mes trajets (conducteur)
PUT    /api/trips/:id/publish       # Publier trajet
PUT    /api/trips/:id/start         # Démarrer trajet
PUT    /api/trips/:id/complete      # Terminer trajet
```

### 📦 Demandes de Transport

```http
GET    /api/requests                # Liste demandes
GET    /api/requests/:id            # Détail demande
POST   /api/requests                # Créer demande (expéditeur)
PUT    /api/requests/:id            # Modifier demande
DELETE /api/requests/:id            # Supprimer demande
PUT    /api/requests/:id/accept     # Accepter demande (conducteur)
PUT    /api/requests/:id/reject     # Refuser demande
PUT    /api/requests/:id/pickup     # Marquer ramassé
PUT    /api/requests/:id/deliver    # Marquer livré
GET    /api/requests/shipper/me     # Mes demandes (expéditeur)
```

### ⭐ Évaluations

```http
GET    /api/reviews                 # Liste évaluations
POST   /api/reviews                 # Créer évaluation
GET    /api/reviews/user/:id        # Évaluations utilisateur
PUT    /api/reviews/:id             # Modifier évaluation
DELETE /api/reviews/:id             # Supprimer évaluation
```

### 💬 Chat & Messages

```http
GET    /api/chat/conversations      # Mes conversations
GET    /api/chat/:requestId         # Messages conversation
POST   /api/chat/:requestId         # Envoyer message
PUT    /api/chat/mark-read          # Marquer lu
```

### 👨‍💼 Administration

```http
GET    /api/admin/dashboard         # Statistiques admin
GET    /api/admin/users             # Gestion utilisateurs
PUT    /api/admin/users/:id/verify  # Vérifier utilisateur
PUT    /api/admin/users/:id/suspend # Suspendre utilisateur
GET    /api/admin/trips             # Gestion trajets
GET    /api/admin/analytics         # Analytiques avancées
```

## 🔌 WebSocket Events (Socket.IO)

### Événements Client → Serveur

```javascript
// Rejoindre une conversation
socket.emit("join_conversation", {
  conversationId,
  requestId,
});

// Envoyer un message
socket.emit("send_message", {
  requestId,
  content,
  type: "text",
});

// Indicateurs de frappe
socket.emit("typing_start", { conversationId });
socket.emit("typing_stop", { conversationId });

// Mise à jour statut
socket.emit("request_status_update", {
  requestId,
  status,
  note,
});

// Partage de localisation
socket.emit("share_location", {
  conversationId,
  location: { lat, lng },
});
```

### Événements Serveur → Client

```javascript
// Nouveau message reçu
socket.on("new_message", (data) => {
  console.log("Message:", data.message);
});

// Notification en temps réel
socket.on("notification", (notification) => {
  console.log("Notification:", notification);
});

// Statut utilisateur
socket.on("user_online", (user) => {
  console.log("User online:", user);
});

// Statut de frappe
socket.on("user_typing", (data) => {
  console.log("User typing:", data.user);
});
```

## 📊 Modèles de Données

### 👤 User Model

```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  role: 'driver' | 'shipper' | 'admin',
  isVerified: Boolean,
  status: 'active' | 'suspended' | 'pending',
  driverInfo: {
    licenseNumber: String,
    vehicleInfo: Object,
    completedTrips: Number,
    totalEarnings: Number
  },
  shipperInfo: {
    companyName: String,
    totalShipments: Number,
    totalSpent: Number
  },
  rating: {
    average: Number,
    count: Number
  }
}
```

### 🚛 Trip Model

```javascript
{
  driver: ObjectId,
  route: {
    departure: { address, city, coordinates },
    destination: { address, city, coordinates },
    intermediateStops: Array
  },
  schedule: {
    departureDate: Date,
    departureTime: String,
    estimatedArrival: Date
  },
  capacity: {
    maxWeight: Number,
    availableWeight: Number,
    maxVolume: Number
  },
  pricing: {
    basePrice: Number,
    pricePerKg: Number,
    negotiable: Boolean
  },
  status: 'draft' | 'published' | 'in-progress' | 'completed'
}
```

### 📦 Request Model

```javascript
{
  shipper: ObjectId,
  trip: ObjectId,
  package: {
    description: String,
    type: String,
    dimensions: {
      weight: Number,
      length: Number,
      width: Number,
      height: Number
    },
    specialHandling: Array
  },
  pickup: {
    address: String,
    city: String,
    contactPerson: Object
  },
  delivery: {
    address: String,
    city: String,
    contactPerson: Object
  },
  pricing: {
    offeredPrice: Number,
    finalPrice: Number
  },
  status: 'pending' | 'accepted' | 'in-transit' | 'delivered'
}
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:ci

# Tests d'intégration
npm run test:integration
```

## 🚀 Déploiement

### Production avec Docker

```bash
# Build image production
docker build -t transportconnect-backend .

# Déployer avec docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Variables d'environnement essentielles

```env
NODE_ENV=production
MONGODB_URI=mongodb://...
JWT_SECRET=super_secret_key
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_password
CLOUDINARY_CLOUD_NAME=your_cloud
```

## 📈 Monitoring & Logs

- **Health Check**: `GET /api/health`
- **Logs structurés** avec Morgan
- **Monitoring** avec Sentry (optionnel)
- **Métriques performance** avec custom middleware

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Documentation API Complète

La documentation Postman complète est disponible dans `/docs/postman/`

## 🛡️ Sécurité

- **Rate limiting** sur les endpoints sensibles
- **Validation des données** avec express-validator
- **Sanitization** des entrées MongoDB
- **Protection XSS** avec helmet
- **CORS** configuré selon l'environnement

## 📞 Support

- **Email**: support@transportconnect.fr
- **Issues GitHub**: [Créer un ticket](https://github.com/transportconnect/backend/issues)
- **Documentation**: [Wiki complet](https://github.com/transportconnect/backend/wiki)

---

**TransportConnect** - Révolutionner la logistique collaborative en France 🇫🇷
