const express = require("express");

const {
  createContactMessage,
  getAllMessages,
  markAsResolved,
  deleteMessage,
} = require("../controllers/contactController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/* =========================
   PUBLIC ROUTES
========================= */

const publicRouter = express.Router();

publicRouter.post("/", createContactMessage);

/* =========================
   ADMIN ROUTES
========================= */

const adminRouter = express.Router();

// All admin routes require authentication + admin role
adminRouter.use(protect, authorizeRoles("admin"));

adminRouter.get("/", getAllMessages);
adminRouter.put("/:id/resolve", markAsResolved);
adminRouter.delete("/:id", deleteMessage);

module.exports = { publicRouter, adminRouter };
