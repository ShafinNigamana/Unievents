const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 — avoids SRV DNS IPv6 resolution issues
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle disconnection after initial connect
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
      setTimeout(() => connectDB(), RETRY_DELAY_MS);
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

  } catch (error) {
    console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s... (${attempt}/${MAX_RETRIES})`);
      setTimeout(() => connectDB(attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error("Max retries reached. Could not connect to MongoDB.");
      process.exit(1);
    }
  }
};

module.exports = connectDB;