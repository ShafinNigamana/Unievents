const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    venue: { type: String, default: "" },

    category: {
      type: String,
      enum: ["Cultural", "Technical", "Sports", "Workshop", "Other"],
      default: "Other",
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
