# TransportConnect - Project Structure

## 📁 Frontend Structure (React + Vite)

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   ├── truck-hero.jpg
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── ui/                          # Existing Shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   ├── chart.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx               # Main navigation
│   │   │   ├── Sidebar.tsx              # Dashboard sidebar
│   │   │   ├── Footer.tsx               # Site footer
│   │   │   ├── RoleBasedLayout.tsx      # Layout wrapper by role
│   │   │   └── ProtectedRoute.tsx       # Auth protection wrapper
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx            # Login form component
│   │   │   ├── RegisterForm.tsx         # Registration form
│   │   │   ├── RoleSelector.tsx         # Role selection component
│   │   │   ├── ForgotPassword.tsx       # Password reset
│   │   │   └── ProfileEdit.tsx          # Edit profile form
│   │   │
│   │   ├── driver/
│   │   │   ├── CreateTripForm.tsx       # Create trip announcement
│   │   │   ├── TripCard.tsx             # Trip display card
│   │   │   ├── RequestsList.tsx         # Incoming requests
│   │   │   ├── TripHistory.tsx          # Driver's trip history
│   │   │   ├── EvaluationForm.tsx       # Rate shipper form
│   │   │   └── VehicleInfo.tsx          # Vehicle details component
│   │   │
│   │   ├── shipper/
│   │   │   ├── TripSearch.tsx           # Search available trips
│   │   │   ├── CreateRequestForm.tsx    # Request transport form
│   │   │   ├── RequestHistory.tsx       # Shipper's requests
│   │   │   ├── PackageDetails.tsx       # Package info component
│   │   │   ├── TripFilters.tsx          # Search filters
│   │   │   └── RateDriver.tsx           # Rate driver form
│   │   │
│   │   ├── admin/
│   │   │   ├── UserManagement.tsx       # Manage users
│   │   │   ├── TripManagement.tsx       # Manage announcements
│   │   │   ├── StatsDashboard.tsx       # Analytics dashboard
│   │   │   ├── UserVerification.tsx     # Verify users
│   │   │   ├── Charts/
│   │   │   │   ├── UsersChart.tsx       # User statistics
│   │   │   │   ├── TripsChart.tsx       # Trip statistics
│   │   │   │   └��─ AcceptanceChart.tsx  # Acceptance rates
│   │   │   └── ReportsTable.tsx         # Reports table
│   │   │
│   │   ���── chat/
│   │   │   ├── ChatWindow.tsx           # Real-time chat interface
│   │   │   ├── MessageBubble.tsx        # Individual message
│   │   │   ├── ChatList.tsx             # List of conversations
│   │   │   └── EmojiPicker.tsx          # Emoji selector
│   │   │
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx       # Loading component
│   │   │   ├── ErrorBoundary.tsx        # Error handling
│   │   │   ├── NotificationToast.tsx    # Notification system
│   │   │   ├── ConfirmDialog.tsx        # Confirmation modal
│   │   │   ├── ImageUpload.tsx          # Image upload component
│   │   │   ├── RatingStars.tsx          # Star rating component
│   │   │   ├── StatusBadge.tsx          # Status indicator
│   │   │   └── SearchInput.tsx          # Reusable search
│   │   │
│   │   └── features/
│   │       ├── notifications/
│   │       │   ├── NotificationCenter.tsx
│   │       │   ├── NotificationItem.tsx
│   │       │   └── NotificationBell.tsx
│   │       │
│   │       ├── reviews/
│   │       │   ├── ReviewCard.tsx
│   │       │   ├── ReviewForm.tsx
│   │       │   └── ReviewsList.tsx
│   │       │
│   │       └── maps/
│   │           ├── RouteMap.tsx          # Trip route visualization
│   │           ├── LocationPicker.tsx    # Pick locations
│   │           └── TrackingMap.tsx       # Real-time tracking
│   │
│   ├── pages/
│   │   ├── Landing.tsx                  # Homepage/landing
│   │   ├── About.tsx                    # About page
│   │   ├── Auth.tsx                     # Login/Register page
│   │   ├── NotFound.tsx                 # 404 page
│   │   │
│   │   ├── driver/
│   │   │   ├── DriverDashboard.tsx      # Driver main dashboard
│   │   │   ├── CreateTrip.tsx           # Create trip page
│   │   │   ├── MyTrips.tsx              # Driver's trips
│   │   │   ├── Requests.tsx             # Received requests
│   │   │   └── DriverProfile.tsx        # Driver profile
│   │   │
│   │   ├── shipper/
│   │   │   ├── ShipperDashboard.tsx     # Shipper main dashboard
│   │   │   ├── SearchTrips.tsx          # Search trips page
│   │   │   ├── MyRequests.tsx           # Shipper's requests
│   │   │   ├── CreateRequest.tsx        # New request page
│   │   │   └── ShipperProfile.tsx       # Shipper profile
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.tsx       # Admin main dashboard
│   │       ├── UsersManagement.tsx      # Manage users page
│   │       ├── TripsManagement.tsx      # Manage trips page
│   │       ├── Analytics.tsx            # Analytics page
│   │       └── Settings.tsx             # Admin settings
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                   # Authentication hook
│   │   ├── useSocket.ts                 # Socket.IO hook
│   │   ├── useNotifications.ts          # Notifications hook
│   │   ├── useGeolocation.ts            # Location services
│   │   ├── useTrips.ts                  # Trip management
│   │   ├── useRequests.ts               # Request management
│   │   ├── useUsers.ts                  # User management
│   │   ├── useChat.ts                   # Chat functionality
│   │   └── useLocalStorage.ts           # Local storage management
│   │
│   ├── lib/
│   │   ├── utils.ts                     # Utility functions
│   │   ├── api.ts                       # API client setup
│   │   ├── auth.ts                      # Auth utilities
│   │   ├── socket.ts                    # Socket.IO client
│   │   ├── constants.ts                 # App constants
│   │   ├── validations.ts               # Form validations
│   │   └── formatters.ts                # Data formatters
│   │
│   ├── store/
│   │   ├── authStore.ts                 # Auth state management
│   │   ├── notificationStore.ts         # Notifications state
│   │   ├── chatStore.ts                 # Chat state
│   │   └── appStore.ts                  # Global app state
│   │
│   ├── types/
│   │   ├── auth.ts                      # Auth types
│   │   ├── user.ts                      # User types
│   │   ├── trip.ts                      # Trip types
│   │   ├── request.ts                   # Request types
│   │   ├── chat.ts                      # Chat types
│   │   ├── notification.ts              # Notification types
│   │   └── api.ts                       # API response types
│   │
│   ├── services/
│   │   ├── authService.ts               # Authentication API
│   │   ├── tripService.ts               # Trip management API
│   │   ├── requestService.ts            # Request management API
│   │   ├── userService.ts               # User management API
│   │   ├── chatService.ts               # Chat API
│   │   ├── notificationService.ts       # Notifications API
│   │   └── uploadService.ts             # File upload API
│   │
│   ├── styles/
│   │   ├── globals.css                  # Global styles
│   │   ├── components.css               # Component styles
│   │   └── animations.css               # Custom animations
│   │
│   ├── App.tsx                          # Main App component
│   ├── main.tsx                         # App entry point
│   └── vite-env.d.ts                    # Vite types
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

## 📁 Backend Structure (Node.js + Express)

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js            # Authentication logic
│   │   ├── userController.js            # User management
│   │   ├── tripController.js            # Trip management
│   │   ├── requestController.js         # Request handling
│   │   ├── reviewController.js          # Reviews/ratings
│   │   ├── chatController.js            # Chat messages
│   │   ├── notificationController.js    # Notifications
│   │   ├── adminController.js           # Admin operations
│   │   └── uploadController.js          # File uploads
│   │
│   ├── models/
│   │   ├── User.js                      # User schema
│   │   ├── Trip.js                      # Trip announcement schema
│   │   ├── Request.js                   # Transport request schema
│   │   ├── Review.js                    # Review/rating schema
│   │   ├── Message.js                   # Chat message schema
│   │   ├── Notification.js              # Notification schema
│   │   └── Vehicle.js                   # Vehicle information schema
│   │
│   ├── routes/
│   │   ├── auth.js                      # Authentication routes
│   │   ├── users.js                     # User routes
│   │   ├── trips.js                     # Trip routes
│   │   ├── requests.js                  # Request routes
│   │   ├── reviews.js                   # Review routes
│   │   ├── chat.js                      # Chat routes
│   │   ├── notifications.js             # Notification routes
│   │   ├── admin.js                     # Admin routes
│   │   └── upload.js                    # File upload routes
│   │
│   ├── middleware/
│   │   ├── auth.js                      # JWT authentication
│   │   ├── roleCheck.js                 # Role-based access
│   │   ├── validation.js                # Input validation
│   │   ├── errorHandler.js              # Error handling
│   │   ├── rateLimiter.js               # Rate limiting
│   │   ├── upload.js                    # File upload middleware
│   │   └── cors.js                      # CORS configuration
│   │
│   ├── services/
│   │   ├── emailService.js              # Email notifications
│   │   ├── authService.js               # Auth business logic
│   │   ├── tripService.js               # Trip business logic
│   │   ├── notificationService.js       # Notification logic
│   │   ├── uploadService.js             # File handling
│   │   └── socketService.js             # Socket.IO logic
│   │
│   ├── utils/
│   │   ├── database.js                  # Database connection
│   │   ├── jwt.js                       # JWT utilities
│   │   ├── bcrypt.js                    # Password hashing
│   │   ├── validators.js                # Validation schemas
│   │   ├── constants.js                 # Server constants
│   │   ├── logger.js                    # Logging utilities
│   │   └── helpers.js                   # Helper functions
│   │
│   ├── config/
│   │   ├── database.js                  # DB configuration
│   │   ├── cloudinary.js                # Image upload config
│   │   ├── email.js                     # Email config
│   │   ├── socket.js                    # Socket.IO config
│   │   └── cors.js                      # CORS settings
│   │
│   ├── socket/
│   │   ├── chatHandler.js               # Chat socket events
│   │   ├── notificationHandler.js       # Notification events
│   │   └── index.js                     # Socket.IO setup
│   │
│   └── app.js                           # Express app setup
│
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── services/
│   │
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── trips.test.js
│   │   └── requests.test.js
│   │
│   └── e2e/
│       ├── userFlow.test.js
│       └── adminFlow.test.js
│
├── docs/
│   ├── api/
│   │   ├── auth.md
│   │   ├── trips.md
│   │   ├── requests.md
│   │   └── admin.md
│   │
│   └── deployment/
│       ├── docker.md
│       ├── nginx.md
│       └── pm2.md
│
├── uploads/                             # User uploaded files
├── logs/                                # Application logs
├── package.json
├── server.js                            # Server entry point
├── .env.example
├── .gitignore
└── README.md
```

## 📁 DevOps & Deployment Structure

```
deployment/
├── docker/
│   ├── Dockerfile.frontend             # Frontend container
│   ├── Dockerfile.backend              # Backend container
│   ├── docker-compose.yml              # Development compose
│   └── docker-compose.prod.yml         # Production compose
│
├── nginx/
│   ├── nginx.conf                      # Nginx configuration
│   ├── ssl/                            # SSL certificates
│   └── sites-available/
│       └── transportconnect.conf       # Site configuration
│
├── jenkins/
│   ├── Jenkinsfile                     # CI/CD pipeline
│   └── scripts/
│       ├── build.sh                    # Build script
│       ├── test.sh                     # Test script
│       └── deploy.sh                   # Deployment script
│
├── pm2/
│   ├── ecosystem.config.js             # PM2 configuration
│   └── logs/                           # PM2 logs
│
└── scripts/
    ├── backup.sh                       # Database backup
    ├── restore.sh                      # Database restore
    └── monitor.sh                      # Health monitoring
```

## 📁 Documentation Structure

```
docs/
├── README.md                           # Main documentation
├── SETUP.md                            # Setup instructions
├── API.md                              # API documentation
├── DEPLOYMENT.md                       # Deployment guide
├── CONTRIBUTING.md                     # Contribution guidelines
├── CHANGELOG.md                        # Version history
│
├── uml/
│   ├── use-case-diagram.png            # Use case diagram
│   ├── class-diagram.png               # Class diagram
│   └── sequence-diagram.png            # Sequence diagram
│
├── mockups/
│   ├── wireframes/                     # UI wireframes
│   └── designs/                        # Final designs
│
└── postman/
    ├── TransportConnect.postman_collection.json
    └── environment.postman_environment.json
```

## 🔧 Key Features by Role

### Driver Features

- Trip announcement creation with route details
- Vehicle and capacity information management
- Request acceptance/rejection system
- Trip history and earnings tracking
- Shipper rating system

### Shipper Features

- Trip search with advanced filtering
- Transport request creation with package details
- Request tracking and history
- Driver rating and review system
- Real-time notifications

### Administrator Features

- User management and verification system
- Trip and request oversight
- Platform analytics with react-chartjs-2
- User badge assignment (Verified status)
- System statistics and reporting

### Shared Features

- JWT-based authentication with role management
- Real-time chat between driver and shipper
- Email notifications for important actions
- Responsive design for all devices
- File upload for documents and photos

This structure provides a solid foundation for your TransportConnect logistics platform with clear separation of concerns, scalability, and maintainability.
