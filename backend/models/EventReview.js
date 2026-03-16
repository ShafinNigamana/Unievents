const mongoose = require("mongoose");

const eventReviewSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per event
eventReviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("EventReview", eventReviewSchema);
