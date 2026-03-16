const EventReview = require("../models/EventReview");
const Event = require("../models/Event");

/* ── Recalculate average rating ── */
const recalcRating = async (eventId) => {
  const result = await EventReview.aggregate([
    { $match: { eventId } },
    {
      $group: {
        _id: "$eventId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      reviewCount: result[0].reviewCount,
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

/* =========================
   CREATE REVIEW
========================= */

const createReview = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;

    // Only students can review
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        error: "Only students can submit reviews",
      });
    }

    // Check event exists and is published or archived
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    if (!["published", "archived"].includes(event.status)) {
      return res.status(400).json({
        success: false,
        error: "Can only review published or archived events",
      });
    }

    // Organizers cannot review their own events
    if (event.createdBy.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Cannot review your own event",
      });
    }

    // Check for duplicate review
    const existing = await EventReview.findOne({
      eventId,
      userId: req.user.id,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "You have already reviewed this event",
      });
    }

    const review = await EventReview.create({
      eventId,
      userId: req.user.id,
      rating,
      comment: comment || null,
    });

    await recalcRating(event._id);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   UPDATE REVIEW
========================= */

const updateReview = async (req, res, next) => {
  try {
    const review = await EventReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Only the review owner can edit
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this review",
      });
    }

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;

    await review.save();
    await recalcRating(review.eventId);

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DELETE REVIEW
========================= */

const deleteReview = async (req, res, next) => {
  try {
    const review = await EventReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Review owner OR admin can delete
    if (
      review.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this review",
      });
    }

    const eventId = review.eventId;
    await review.deleteOne();
    await recalcRating(eventId);

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET EVENT REVIEWS
========================= */

const getEventReviews = async (req, res, next) => {
  try {
    const reviews = await EventReview.find({ eventId: req.params.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getEventReviews,
};
