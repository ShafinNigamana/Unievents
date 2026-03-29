const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Temporary SRV DNS fix using Google DNS

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

// Routes
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const { publicRouter: publicFaqRoutes, adminRouter: adminFaqRoutes } = require("./routes/faqRoutes");
const { publicRouter: publicContactRoutes, adminRouter: adminContactRoutes } = require("./routes/contactRoutes");
const publicRoutes = require("./routes/publicRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

/* =========================
   SECURITY MIDDLEWARE
========================= */

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // generous limit for development
});
app.use(limiter);

// CORS
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

/* =========================
   CONNECT DATABASE
========================= */

connectDB();

/* =========================
   HEALTH CHECK ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("Unievents Backend Running");
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "unievents-api",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/public/faqs", publicFaqRoutes);
app.use("/api/v1/admin/faqs", adminFaqRoutes);
app.use("/api/v1/public/contact", publicContactRoutes);
app.use("/api/v1/admin/contact-messages", adminContactRoutes);
app.use("/api/v1/public", publicRoutes);

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});