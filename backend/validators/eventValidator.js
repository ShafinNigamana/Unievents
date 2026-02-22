const { z } = require("zod");

/* =========================
   CREATE EVENT VALIDATION
========================= */

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(2, "Category is required"),
  eventDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/* =========================
   UPDATE EVENT VALIDATION
========================= */

const updateEventSchema = createEventSchema.partial();

/* =========================
   STATUS VALIDATION
========================= */

const statusSchema = z.object({
  status: z.enum(["published", "archived"]),
});

/* =========================
   APPROVAL VALIDATION
========================= */

const approvalSchema = z.object({
  approvalStatus: z.enum(["approved", "rejected"]),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  statusSchema,
  approvalSchema,
};