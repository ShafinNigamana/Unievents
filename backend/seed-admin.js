// Run: node seed-admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require("./models/User");

    const existing = await User.findOne({ email: "admin@unievents.com" });
    if (existing) { console.log("Admin already exists!"); process.exit(); }

    await User.create({
        name: "Admin",
        email: "admin@unievents.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        isActive: true,
        isDeleted: false,
    });

    console.log("✅ Admin created: admin@unievents.com / admin123");
    process.exit();
}

main().catch(console.error);
