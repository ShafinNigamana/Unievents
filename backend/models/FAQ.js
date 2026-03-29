const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },

    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      enum: ["General", "Registration", "Eligibility", "Account", "Organizer"],
      default: "General",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FAQ", faqSchema);
