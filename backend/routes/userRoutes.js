const express = require("express");
const router = express.Router();

const {
    toggleSavedEvent,
    getSavedEvents,
    getMyRegistrations,
    getMyProfile,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/* =========================
   PROFILE ROUTE
   Must be defined BEFORE /:param style routes
========================= */

router.get(
    "/me/profile",
    protect,
    authorizeRoles("student"),
    getMyProfile
);

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