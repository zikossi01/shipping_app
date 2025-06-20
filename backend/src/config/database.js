const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/transportconnect",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);

    // Database event listeners
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("📊 MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("📊 MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
