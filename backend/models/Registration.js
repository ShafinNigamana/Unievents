const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        /* =========================
           CORE FIELDS
        ========================= */

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

        /* =========================
           STATUS
        ========================= */

        status: {
            type: String,
            enum: ["registered", "cancelled"],
            default: "registered",
            required: true,
        },

        /* =========================
           TIMESTAMPS
        ========================= */

        registeredAt: {
            type: Date,
            default: Date.now,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================
   COMPOUND UNIQUE INDEX
   One registration per user per event
========================= */

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);