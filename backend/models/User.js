const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "organizer", "admin"],
      default: "student",
    },

    // ✅ NEW — Student identity
    enrollmentId: {
      type: String,
      unique: true,
      sparse: true, // allows null for organizers
      trim: true,
    },

    // ✅ OPTIONAL
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
