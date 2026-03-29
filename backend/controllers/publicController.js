const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const EventReview = require("../models/EventReview");

/* =========================
   GET PUBLIC STATS
========================= */

const getPublicStats = async (req, res, next) => {
  try {
    const [
      totalEvents,
      publishedEvents,
      archivedEvents,
      totalUsers,
      totalStudents,
      totalOrganizers,
      totalRegistrations,
      totalReviews,
      departmentsList,
    ] = await Promise.all([
      // Total events (not soft-deleted)
      Event.countDocuments({ isDeleted: false }),

      // Published events
      Event.countDocuments({ status: "published", isDeleted: false }),

      // Archived events
      Event.countDocuments({ status: "archived", isDeleted: false }),

      // Total users (not soft-deleted)
      User.countDocuments({ isDeleted: false }),

      // Total students
      User.countDocuments({ role: "student", isDeleted: false }),

      // Total organizers
      User.countDocuments({ role: "organizer", isDeleted: false }),

      // Total active registrations
      Registration.countDocuments({ status: "registered" }),

      // Total reviews
      EventReview.countDocuments(),

      // Distinct departments (exclude null/empty)
      User.distinct("department", {
        department: { $ne: null, $nin: [""] },
        isDeleted: false,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        archivedEvents,
        totalUsers,
        totalStudents,
        totalOrganizers,
        totalRegistrations,
        totalReviews,
        departments: departmentsList.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats,
};
