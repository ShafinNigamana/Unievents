const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* =========================
       CORE AUTH FIELDS
    ========================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "organizer", "admin"],
      required: true,
    },

    enrollmentId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // null values are excluded from the unique constraint
    },

    /* =========================
       ACADEMIC PROFILE FIELDS
       Phase 2 — Update Profile
    ========================= */

    department: {
      type: String,
      trim: true,
      default: null,
    },

    semester: {
      type: Number,
      default: null,
    },

    year: {
      type: Number,
      default: null,
    },

    cgpa: {
      type: Number,
      default: null,
      min: [0, "CGPA cannot be less than 0"],
      max: [10, "CGPA cannot exceed 10"],
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },

    /* =========================
       PHASE 2 — SAVED EVENTS
    ========================= */

    savedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    /* =========================
       SYSTEM FIELDS
    ========================= */

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);