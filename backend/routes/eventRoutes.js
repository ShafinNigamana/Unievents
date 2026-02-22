const express = require("express");

const {
  createEvent,
  updateEvent,
  changeEventStatus,
  approveEvent,
  softDeleteEvent,
  restoreEvent,
  permanentDeleteEvent,
  getPublishedEvents,
  getSingleEvent,
  getArchivedEvents,
  getMyEvents,
  getAllEvents,
  getSoftDeletedEvents,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { checkOwnership } = require("../middleware/ownershipMiddleware");
const { validateLifecycle } = require("../middleware/lifecycleMiddleware");
const { preventIfSoftDeleted } = require("../middleware/softDeleteGuard");
const { validateRequest } = require("../middleware/validateRequest");

const {
  createEventSchema,
  updateEventSchema,
  statusSchema,
  approvalSchema,
} = require("../validators/eventValidator");

const router = express.Router();

/* =========================
   PUBLIC ROUTES
========================= */

router.get("/", getPublishedEvents);
router.get("/archive", getArchivedEvents);

/* =========================
   AUTH REQUIRED ROUTES
========================= */

// Organizer Dashboard
router.get(
  "/my",
  protect,
  authorizeRoles("organizer", "admin"),
  getMyEvents
);

// Admin: View Soft Deleted
router.get(
  "/deleted",
  protect,
  authorizeRoles("admin"),
  getSoftDeletedEvents
);

// Admin: View ALL events (any status)
router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  getAllEvents
);

/* =========================
   CREATE EVENT
========================= */

router.post(
  "/",
  protect,
  authorizeRoles("organizer", "admin"),
  validateRequest(createEventSchema),
  createEvent
);

/* =========================
   UPDATE EVENT
========================= */

router.put(
  "/:id",
  protect,
  authorizeRoles("organizer", "admin"),
  checkOwnership,
  preventIfSoftDeleted,
  validateRequest(updateEventSchema),
  updateEvent
);

/* =========================
   CHANGE STATUS
========================= */

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("organizer", "admin"),
  checkOwnership,
  preventIfSoftDeleted,
  validateRequest(statusSchema),
  validateLifecycle,
  changeEventStatus
);

/* =========================
   APPROVAL
========================= */

router.patch(
  "/:id/approve",
  protect,
  authorizeRoles("admin"),
  checkOwnership,
  validateRequest(approvalSchema),
  approveEvent
);

/* =========================
   SOFT DELETE
========================= */

router.delete(
  "/:id",
  protect,
  authorizeRoles("organizer", "admin"),
  checkOwnership,
  preventIfSoftDeleted,
  softDeleteEvent
);

/* =========================
   PERMANENT DELETE
========================= */

router.delete(
  "/:id/permanent",
  protect,
  authorizeRoles("admin"),
  checkOwnership,
  permanentDeleteEvent
);

/* =========================
   RESTORE
========================= */

router.patch(
  "/:id/restore",
  protect,
  authorizeRoles("admin"),
  checkOwnership,
  restoreEvent
);

/* =========================
   SINGLE EVENT (KEEP LAST)
========================= */

router.get("/:id", getSingleEvent);

module.exports = router;