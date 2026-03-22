const express = require("express");
const router = express.Router();

const {
    toggleSavedEvent,
    getSavedEvents,
    getMyRegistrations,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/* =========================
   SAVED EVENTS ROUTES
   All routes: authenticated + student only
========================= */

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

/* =========================
   REGISTRATION ROUTES
   All routes: authenticated + student only
========================= */

router.get(
    "/registrations",
    protect,
    authorizeRoles("student"),
    getMyRegistrations
);

module.exports = router;