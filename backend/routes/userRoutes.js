const express = require("express");
const router = express.Router();

const {
    toggleSavedEvent,
    getSavedEvents,
    getMyRegistrations,
    getMyProfile,
    updateProfile,
    changePassword,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

/* =========================
   PROFILE ROUTES
   Defined FIRST — before any /:param routes
   Order matters: /me/password before /me/profile before /me
========================= */

// PUT change password
router.put(
    "/me/password",
    protect,
    authorizeRoles("student"),
    changePassword
);

// GET full aggregated profile
router.get(
    "/me/profile",
    protect,
    authorizeRoles("student"),
    getMyProfile
);

// PUT update profile info
router.put(
    "/me",
    protect,
    authorizeRoles("student"),
    updateProfile
);

/* =========================
   SAVED EVENTS ROUTES
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
========================= */

router.get(
    "/registrations",
    protect,
    authorizeRoles("student"),
    getMyRegistrations
);

module.exports = router;