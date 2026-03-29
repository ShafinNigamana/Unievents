const express = require("express");

const {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/faqController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/* =========================
   PUBLIC ROUTES
========================= */

const publicRouter = express.Router();

publicRouter.get("/", getFAQs);

/* =========================
   ADMIN ROUTES
========================= */

const adminRouter = express.Router();

// All admin routes require authentication + admin role
adminRouter.use(protect, authorizeRoles("admin"));

adminRouter.post("/", createFAQ);
adminRouter.put("/:id", updateFAQ);
adminRouter.delete("/:id", deleteFAQ);

module.exports = { publicRouter, adminRouter };
