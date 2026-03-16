const { z } = require("zod");

const createReviewSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  rating: z
    .number({ required_error: "Rating is required" })
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .max(500, "Comment cannot exceed 500 characters")
    .optional()
    .nullable(),
});

const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .optional(),
  comment: z
    .string()
    .max(500, "Comment cannot exceed 500 characters")
    .optional()
    .nullable(),
});

module.exports = { createReviewSchema, updateReviewSchema };
