const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["admin", "organizer", "student"],
      default: "student",
    },

    department: String,
    semester: String,
    phone: String,
  },
  { timestamps: true }
);

// Password hash
// Password hash (CORRECT for async mongoose)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


// Compare password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
