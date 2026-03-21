const express = require("express");
const router = express.Router();

const { toggleSavedEvent, getSavedEvents } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/* =========================
   SAVED EVENTS ROUTES
   All routes: authenticated + student only
========================= */

// GET  /api/v1/users/saved-events      → get all saved events for logged-in student
// POST /api/v1/users/saved-events/:eventId → toggle save/unsave

router.get(
    "/saved-events",
    protect,
    authorizeRoles("student"),
    getSavedEvents
);

router.post(
    "/saved-events/:eventId",
    protect,
    authorizeRoles("student"),
    toggleSavedEvent
);

module.exports = router;