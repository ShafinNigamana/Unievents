const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// READ
router.get("/", protect, getAllEvents);

// WRITE
router.post("/", protect, authorize("admin", "organizer"), createEvent);
router.put("/:id", protect, authorize("admin", "organizer"), updateEvent);
router.delete("/:id", protect, authorize("admin", "organizer"), deleteEvent);

module.exports = router;
