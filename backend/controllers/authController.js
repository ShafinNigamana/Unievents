const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * REGISTER
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      enrollmentId,
      phone,
    } = req.body;

    // 1️⃣ Required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // 2️⃣ Role validation
    if (!["student", "organizer"].includes(role)) {
      return res.status(403).json({
        message: "Invalid role selection",
      });
    }

    // 3️⃣ Password rules
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (confirmPassword && confirmPassword !== password) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // 4️⃣ Student enrollment ID rules
    if (role === "student") {
      if (!enrollmentId) {
        return res.status(400).json({
          message: "Enrollment ID is required for students",
        });
      }

      const enrollmentRegex = /^[a-zA-Z0-9]+$/;
      if (!enrollmentRegex.test(enrollmentId)) {
        return res.status(400).json({
          message: "Enrollment ID must be alphanumeric",
        });
      }

      const existingEnrollment = await User.findOne({ enrollmentId });
      if (existingEnrollment) {
        return res.status(409).json({
          message: "Enrollment ID already exists",
        });
      }
    }

    // 5️⃣ Optional phone validation
    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          message: "Phone number must be 10 digits",
        });
      }
    }

    // 6️⃣ Duplicate email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // 7️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8️⃣ Create user
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      enrollmentId: role === "student" ? enrollmentId : undefined,
      phone,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

/**
 * LOGIN (UNCHANGED LOGIC)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = { register, login };
