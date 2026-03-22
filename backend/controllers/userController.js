const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const EventReview = require("../models/EventReview");

/* =========================
   TOGGLE SAVED EVENT
   POST /api/v1/users/saved-events/:eventId
========================= */

const toggleSavedEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        // Check event exists
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Event not found",
            });
        }

        // Event must not be soft-deleted
        if (event.isDeleted) {
            return res.status(400).json({
                success: false,
                error: "Cannot save a deleted event",
            });
        }

        // Event must be published
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
            // Unsave — remove from array
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
            // Save — add to array
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

        // After populate, soft-deleted events resolve to null — filter them out
        const validEvents = (user.savedEvents || []).filter(Boolean);

        // Cleanup: remove stale IDs (soft-deleted events) from user's savedEvents array
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

        // Filter out registrations where event was soft-deleted (populate returns null)
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
            "name email enrollmentId role createdAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // ── 2. Saved Events ─────────────────────────────────────────
        // From User.savedEvents — exclude soft-deleted, include archived
        const userWithSaved = await User.findById(userId).populate({
            path: "savedEvents",
            match: { isDeleted: false },
            select:
                "title category eventDate venue posterUrl status averageRating reviewCount year",
        });
        const savedEvents = (userWithSaved.savedEvents || []).filter(Boolean);

        // ── 3. Registered Events ────────────────────────────────────
        // Active registrations only — exclude soft-deleted, include archived
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
        // Events where this user is in interestedUsers array
        // Only published + archived, exclude soft-deleted
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

        // ── Response ────────────────────────────────────────────────
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

module.exports = {
    toggleSavedEvent,
    getSavedEvents,
    getMyRegistrations,
    getMyProfile,
};