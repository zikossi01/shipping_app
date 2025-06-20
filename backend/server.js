const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./src/config/database");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const tripRoutes = require("./src/routes/trips");
const requestRoutes = require("./src/routes/requests");
const reviewRoutes = require("./src/routes/reviews");
const chatRoutes = require("./src/routes/chat");
const notificationRoutes = require("./src/routes/notifications");
const adminRoutes = require("./src/routes/admin");
const uploadRoutes = require("./src/routes/upload");

const { errorHandler } = require("./src/middleware/errorHandler");
const { setupSocket } = require("./src/socket");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
});
app.use("/api/", limiter);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(morgan("combined"));

// Socket.IO setup
setupSocket(io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "TransportConnect API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Static files for uploads
app.use("/uploads", express.static("uploads"));

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚛 TransportConnect API running on port ${PORT}`);
  console.log(
    `📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`,
  );
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`💬 Socket.IO ready for real-time communication`);
});

module.exports = { app, io };
