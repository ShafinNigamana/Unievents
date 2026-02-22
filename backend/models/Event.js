const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    /* =========================
       CORE FIELDS
    ========================= */

    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    /* =========================
       OWNERSHIP
    ========================= */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       SCHEDULING
    ========================= */

    eventDate: {
      type: Date,
      required: true,
      index: true,
    },

    startTime: {
      type: String,
      default: null,
    },

    endTime: {
      type: String,
      default: null,
    },

    venue: {
      type: String,
      trim: true,
      default: null,
    },

    /* =========================
       LIFECYCLE
    ========================= */

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      required: true,
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    archivedAt: {
      type: Date,
      default: null,
    },

    /* =========================
       APPROVAL
    ========================= */

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /* =========================
       SOFT DELETE
    ========================= */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =========================
       ARCHIVE INTELLIGENCE
    ========================= */

    year: {
      type: Number,
      index: true,
    },

    semester: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   AUTO-DERIVE YEAR
========================= */

eventSchema.pre("save", async function () {
  if (this.eventDate) {
    this.year = new Date(this.eventDate).getFullYear();
  }
});

/* =========================
   TEXT SEARCH INDEX
========================= */

eventSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Event", eventSchema);