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
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("Unievents Backend Running ✅");
});

// API Routes
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
