const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const EventReview = require("../models/EventReview");
const bcrypt = require("bcryptjs");

/* =========================
   TOGGLE SAVED EVENT
   POST /api/v1/users/saved-events/:eventId
========================= */

const toggleSavedEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Event not found",
            });
        }

        if (event.isDeleted) {
            return res.status(400).json({
                success: false,
                error: "Cannot save a deleted event",
            });
        }

        if (event.status !== "published") {
            return res.status(400).json({
                success: false,
                error: "Only published events can be saved",
            });
        }

        const user = await User.findById(userId);

        const alreadySaved = user.savedEvents.some(
            (id) => id.toString() === eventId
        );

        if (alreadySaved) {
            user.savedEvents = user.savedEvents.filter(
                (id) => id.toString() !== eventId
            );
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Event removed from saved list",
                saved: false,
            });
        } else {
            user.savedEvents.push(eventId);
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Event saved successfully",
                saved: true,
            });
        }
    } catch (error) {
        next(error);
    }
};

/* =========================
   GET SAVED EVENTS
   GET /api/v1/users/saved-events
========================= */

const getSavedEvents = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate({
            path: "savedEvents",
            match: { isDeleted: false },
            select:
                "title description category eventDate endDate startTime endTime venue tags posterUrl status approvalStatus averageRating reviewCount interestedUsers interestedCount year createdBy",
        });

        const validEvents = (user.savedEvents || []).filter(Boolean);

        const validIds = validEvents.map((e) => e._id.toString());
        const rawUser = await User.findById(userId).select("savedEvents");
        const hasStale = rawUser.savedEvents.some(
            (id) => !validIds.includes(id.toString())
        );

        if (hasStale) {
            await User.findByIdAndUpdate(userId, {
                savedEvents: validIds,
            });
        }

        res.status(200).json({
            success: true,
            count: validEvents.length,
            data: validEvents,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   GET MY REGISTRATIONS
   GET /api/v1/users/registrations
========================= */

const getMyRegistrations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const registrations = await Registration.find({ userId })
            .populate({
                path: "eventId",
                match: { isDeleted: false },
                select:
                    "title description category eventDate endDate startTime endTime venue posterUrl status approvalStatus capacity registeredCount year",
            })
            .sort({ registeredAt: -1 });

        const validRegistrations = registrations.filter((r) => r.eventId !== null);

        return res.status(200).json({
            success: true,
            count: validRegistrations.length,
            data: validRegistrations,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   GET MY PROFILE
   GET /api/v1/users/me/profile
========================= */

const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // ── 1. User basic info ──────────────────────────────────────
        const user = await User.findById(userId).select(
            "name email enrollmentId role department semester year cgpa phone skills createdAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // ── 2. Saved Events ─────────────────────────────────────────
        const userWithSaved = await User.findById(userId).populate({
            path: "savedEvents",
            match: { isDeleted: false },
            select:
                "title category eventDate venue posterUrl status averageRating reviewCount year",
        });
        const savedEvents = (userWithSaved.savedEvents || []).filter(Boolean);

        // ── 3. Registered Events ────────────────────────────────────
        const registrations = await Registration.find({
            userId,
            status: "registered",
        }).populate({
            path: "eventId",
            match: { isDeleted: false },
            select:
                "title category eventDate venue posterUrl status capacity registeredCount year",
        });
        const registeredEvents = registrations
            .filter((r) => r.eventId !== null)
            .map((r) => ({
                registration: {
                    _id: r._id,
                    status: r.status,
                    registeredAt: r.registeredAt,
                },
                event: r.eventId,
            }));

        // ── 4. Interested Events ────────────────────────────────────
        const interestedEvents = await Event.find({
            interestedUsers: userId,
            isDeleted: false,
            status: { $in: ["published", "archived"] },
        }).select(
            "title category eventDate venue posterUrl status interestedCount year"
        );

        // ── 5. My Reviews ───────────────────────────────────────────
        const reviews = await EventReview.find({ userId })
            .populate({
                path: "eventId",
                match: { isDeleted: false },
                select: "title category eventDate posterUrl status year",
            })
            .select("rating comment createdAt eventId")
            .sort({ createdAt: -1 });
        const myReviews = reviews.filter((r) => r.eventId !== null);

        return res.status(200).json({
            success: true,
            data: {
                user,
                savedEvents,
                registeredEvents,
                interestedEvents,
                myReviews,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   UPDATE MY PROFILE
   PUT /api/v1/users/me
========================= */

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // ── Whitelist — only these fields can be updated ────────────
        const {
            name,
            email,
            enrollmentId,
            department,
            semester,
            year,
            cgpa,
            phone,
            skills,
        } = req.body;

        // ── Validation ──────────────────────────────────────────────

        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    error: "Name must be at least 2 characters",
                });
            }
        }

        if (email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid email format",
                });
            }
            const existing = await User.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: userId },
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    error: "Email is already in use by another account",
                });
            }
        }

        if (enrollmentId !== undefined && enrollmentId !== null) {
            const existingEnrollment = await User.findOne({
                enrollmentId,
                _id: { $ne: userId },
            });
            if (existingEnrollment) {
                return res.status(409).json({
                    success: false,
                    error: "Enrollment ID is already in use",
                });
            }
        }

        if (semester !== undefined && semester !== null) {
            if (typeof semester !== "number" || isNaN(semester) || !Number.isInteger(semester) || semester < 1 || semester > 12) {
                return res.status(400).json({
                    success: false,
                    error: "Semester must be a whole number between 1 and 12",
                });
            }
        }

        if (year !== undefined && year !== null) {
            if (typeof year !== "number" || isNaN(year) || !Number.isInteger(year) || year < 1 || year > 6) {
                return res.status(400).json({
                    success: false,
                    error: "Year must be a whole number between 1 and 6",
                });
            }
        }

        if (cgpa !== undefined && cgpa !== null) {
            if (typeof cgpa !== "number" || isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                return res.status(400).json({
                    success: false,
                    error: "CGPA must be a number between 0 and 10",
                });
            }
        }

        if (skills !== undefined) {
            if (!Array.isArray(skills)) {
                return res.status(400).json({
                    success: false,
                    error: "Skills must be an array",
                });
            }
            if (skills.some((s) => typeof s !== "string" || s.trim().length === 0)) {
                return res.status(400).json({
                    success: false,
                    error: "Each skill must be a non-empty string",
                });
            }
        }

        if (phone !== undefined && phone !== null && phone !== "") {
            const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid phone number format",
                });
            }
        }

        // ── Build update object ──────────────────────────────────────
        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (email !== undefined) updates.email = email.toLowerCase().trim();
        if (enrollmentId !== undefined) updates.enrollmentId = enrollmentId;
        if (department !== undefined) updates.department = department?.trim() || null;
        if (semester !== undefined) updates.semester = semester;
        if (year !== undefined) updates.year = year;
        if (cgpa !== undefined) updates.cgpa = cgpa;
        if (phone !== undefined) updates.phone = phone?.trim() || null;
        if (skills !== undefined) updates.skills = skills.map((s) => s.trim());

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select(
            "name email enrollmentId department semester year cgpa phone skills createdAt"
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                error: `${field === "email" ? "Email" : "Enrollment ID"} is already in use`,
            });
        }
        next(error);
    }
};

/* =========================
   CHANGE PASSWORD
   PUT /api/v1/users/me/password
========================= */

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // ── Required field checks ────────────────────────────────────
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Both currentPassword and newPassword are required",
            });
        }

        // ── New password length ──────────────────────────────────────
        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: "New password must be at least 6 characters",
            });
        }

        // ── Fetch user with password (select: false requires explicit +password) ──
        const user = await User.findById(userId).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // ── Verify current password ──────────────────────────────────
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Current password is incorrect",
            });
        }

        // ── New password cannot be same as current ───────────────────
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({
                success: false,
                error: "New password must be different from current password",
            });
        }

        // ── Hash and save ────────────────────────────────────────────
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // ── Never return password in response ────────────────────────
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    toggleSavedEvent,
    getSavedEvents,
    getMyRegistrations,
    getMyProfile,
    updateProfile,
    changePassword,
};