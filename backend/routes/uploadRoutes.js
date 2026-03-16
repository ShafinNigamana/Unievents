const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { uploadEventPoster } = require("../middleware/uploadMiddleware");
const {
  uploadEventPoster: uploadEventPosterController,
} = require("../controllers/uploadController");

router.post(
  "/event-poster",
  protect,
  authorizeRoles("organizer", "admin"),
  uploadEventPoster,
  uploadEventPosterController
);

module.exports = router;
