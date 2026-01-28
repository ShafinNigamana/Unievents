const dns = require("dns");
dns.setServers(["1.1.1.1"]); // temporary fix for SRV DNS

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Routes
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // ✅ REQUIRED for req.body

// Connect DB
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("Unievents Backend Running ✅");
});

// API Routes
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

// 🔍 Global error handler (DEV ONLY)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
