const User = require("../models/User");
const Event = require("../models/Event");

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
            match: { isDeleted: false }, // exclude soft-deleted events
            select:
                "title description category eventDate endDate startTime endTime venue tags posterUrl status approvalStatus averageRating reviewCount year createdBy",
        });

        // After populate, soft-deleted events resolve to null — filter them out
        const validEvents = (user.savedEvents || []).filter(Boolean);

        // Cleanup: remove stale IDs (soft-deleted events) from user's savedEvents array
        // so they don't accumulate over time
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

module.exports = {
    toggleSavedEvent,
    getSavedEvents,
};