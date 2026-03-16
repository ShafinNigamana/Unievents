const express = require("express");

const {
  createReview,
  updateReview,
  deleteReview,
  getEventReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validators/reviewValidator");

const router = express.Router();

/* =========================
   PUBLIC — read reviews
========================= */

router.get("/events/:id/reviews", getEventReviews);

/* =========================
   AUTHENTICATED — write reviews
========================= */

// Create review (students only)
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  validateRequest(createReviewSchema),
  createReview
);

// Update review (review owner — checked in controller)
router.put(
  "/:id",
  protect,
  validateRequest(updateReviewSchema),
  updateReview
);

// Delete review (review owner or admin — checked in controller)
router.delete(
  "/:id",
  protect,
  deleteReview
);

module.exports = router;
