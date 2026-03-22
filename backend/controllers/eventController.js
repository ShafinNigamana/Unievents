const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

/* =========================
   AUTO ARCHIVE HELPER
========================= */

const autoArchiveIfExpired = async (event) => {
  if (
    event.status === "published" &&
    new Date(event.eventDate) < new Date()
  ) {
    event.status = "archived";
    event.archivedAt = new Date();
    await event.save();
  }
};

/* =========================
   PAGINATION HELPER
========================= */

const paginate = (query, req) => {
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);

  if (page > 0 && limit > 0) {
    const skip = (page - 1) * limit;
    return { paginatedQuery: query.skip(skip).limit(limit), page, limit };
  }

  return { paginatedQuery: query, page: null, limit: null };
};

/* =========================
   ELIGIBILITY HELPER
   Checks student profile against event requirements.
   Returns { eligible: true } or { eligible: false, reason: "..." }
========================= */

const checkEligibility = (student, requirements) => {
  // No requirements defined — open to all
  if (!requirements) return { eligible: true };

  const {
    departments = [],
    semesters = [],
    years = [],
    minCgpa = null,
    skills = [],
  } = requirements;

  const hasRequirements =
    departments.length > 0 ||
    semesters.length > 0 ||
    years.length > 0 ||
    minCgpa !== null ||
    skills.length > 0;

  // No restrictions at all — open to all
  if (!hasRequirements) return { eligible: true };

  // ── Department check ─────────────────────────────
  if (departments.length > 0) {
    if (!student.department) {
      return {
        eligible: false,
        reason: "incomplete",
        field: "department",
      };
    }
    if (!departments.includes(student.department)) {
      return { eligible: false, reason: "ineligible" };
    }
  }

  // ── Semester check ───────────────────────────────
  if (semesters.length > 0) {
    if (student.semester === null || student.semester === undefined) {
      return {
        eligible: false,
        reason: "incomplete",
        field: "semester",
      };
    }
    if (!semesters.includes(student.semester)) {
      return { eligible: false, reason: "ineligible" };
    }
  }

  // ── Year check ───────────────────────────────────
  if (years.length > 0) {
    if (student.year === null || student.year === undefined) {
      return {
        eligible: false,
        reason: "incomplete",
        field: "year",
      };
    }
    if (!years.includes(student.year)) {
      return { eligible: false, reason: "ineligible" };
    }
  }

  // ── CGPA check ───────────────────────────────────
  if (minCgpa !== null) {
    if (student.cgpa === null || student.cgpa === undefined) {
      return {
        eligible: false,
        reason: "incomplete",
        field: "cgpa",
      };
    }
    if (student.cgpa < minCgpa) {
      return { eligible: false, reason: "ineligible" };
    }
  }

  // ── Skills check — at least one match required ───
  if (skills.length > 0) {
    if (!student.skills || student.skills.length === 0) {
      return {
        eligible: false,
        reason: "incomplete",
        field: "skills",
      };
    }
    const studentSkillsLower = student.skills.map((s) => s.toLowerCase());
    const requiredSkillsLower = skills.map((s) => s.toLowerCase());
    const hasMatch = requiredSkillsLower.some((s) =>
      studentSkillsLower.includes(s)
    );
    if (!hasMatch) {
      return { eligible: false, reason: "ineligible" };
    }
  }

  return { eligible: true };
};

/* =========================
   CREATE EVENT
========================= */

const createEvent = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized",
      });
    }

    const {
      title,
      description,
      category,
      eventDate,
      endDate,
      startTime,
      endTime,
      venue,
      tags,
      posterUrl,
      posterPublicId,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      eventDate,
      endDate: endDate || null,
      startTime: startTime || null,
      endTime: endTime || null,
      venue: venue || null,
      tags: tags || [],
      posterUrl: posterUrl || null,
      posterPublicId: posterPublicId || null,
      createdBy: req.user.id,
      status: "draft",
      approvalStatus: "pending",
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   UPDATE EVENT
========================= */

const updateEvent = async (req, res, next) => {
  try {
    const event = req.event;

    if (event.status === "archived" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Archived events cannot be modified",
      });
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CHANGE STATUS
========================= */

const changeEventStatus = async (req, res, next) => {
  try {
    const event = req.event;
    const { status } = req.body;

    if (status === "published") {
      if (event.approvalStatus !== "approved") {
        return res.status(400).json({
          success: false,
          error: "Event must be approved before publishing",
        });
      }
      event.status = "published";
      event.publishedAt = new Date();
    }

    if (status === "archived") {
      event.status = "archived";
      event.archivedAt = new Date();
    }

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   APPROVE EVENT
========================= */

const approveEvent = async (req, res, next) => {
  try {
    const event = req.event;
    const { approvalStatus } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid approval status",
      });
    }

    if (event.status === "archived") {
      return res.status(400).json({
        success: false,
        error: "Cannot approve archived event",
      });
    }

    event.approvalStatus = approvalStatus;
    event.approvedBy = req.user.id;
    event.approvedAt = new Date();

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   SOFT DELETE
========================= */

const softDeleteEvent = async (req, res, next) => {
  try {
    const event = req.event;

    if (event.status === "archived" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Archived events cannot be deleted by organizers",
      });
    }

    event.isDeleted = true;
    event.deletedAt = new Date();
    event.deletedBy = req.user.id;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event soft deleted",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   RESTORE
========================= */

const restoreEvent = async (req, res, next) => {
  try {
    const event = req.event;

    event.isDeleted = false;
    event.deletedAt = null;
    event.deletedBy = null;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event restored",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   PERMANENT DELETE
========================= */

const permanentDeleteEvent = async (req, res, next) => {
  try {
    const event = req.event;

    if (!event.isDeleted) {
      return res.status(400).json({
        success: false,
        error: "Event must be soft-deleted first",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   TOGGLE INTEREST
   POST /api/v1/events/:id/interest
========================= */

const toggleInterest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    if (event.isDeleted) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    if (event.status !== "published") {
      return res.status(400).json({
        success: false,
        error: "Can only mark interest in published events",
      });
    }

    const alreadyInterested = event.interestedUsers.some(
      (id) => id.toString() === userId
    );

    if (alreadyInterested) {
      event.interestedUsers = event.interestedUsers.filter(
        (id) => id.toString() !== userId
      );
      event.interestedCount = Math.max(0, event.interestedCount - 1);

      await event.save();

      return res.status(200).json({
        success: true,
        message: "Interest removed",
        interested: false,
        interestedCount: event.interestedCount,
      });
    } else {
      event.interestedUsers.push(userId);
      event.interestedCount = event.interestedUsers.length;

      await event.save();

      return res.status(200).json({
        success: true,
        message: "Interest marked",
        interested: true,
        interestedCount: event.interestedCount,
      });
    }
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET PUBLISHED EVENTS
========================= */

const getPublishedEvents = async (req, res, next) => {
  try {
    const { year, category, search, tag } = req.query;

    let filter = {
      status: "published",
      isDeleted: false,
    };

    if (year) filter.year = Number(year);
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    let query = Event.find(filter).sort({ eventDate: -1 });

    const { paginatedQuery, page, limit } = paginate(query, req);
    const events = await paginatedQuery;

    for (let event of events) {
      await autoArchiveIfExpired(event);
    }

    const response = {
      success: true,
      count: events.length,
      data: events,
    };
    if (page) { response.page = page; response.limit = limit; }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET SINGLE EVENT
========================= */

const getSingleEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    await autoArchiveIfExpired(event);

    if (event.isDeleted && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    if (event.status === "draft") {
      if (
        !req.user ||
        (event.createdBy.toString() !== req.user.id &&
          req.user.role !== "admin")
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view draft",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET ARCHIVED EVENTS
========================= */

const getArchivedEvents = async (req, res, next) => {
  try {
    const { year, category, tag } = req.query;

    let filter = {
      status: "archived",
      isDeleted: false,
    };

    if (year) filter.year = Number(year);
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    let query = Event.find(filter).sort({ eventDate: -1 });

    const { paginatedQuery, page, limit } = paginate(query, req);
    const events = await paginatedQuery;

    const response = {
      success: true,
      count: events.length,
      data: events,
    };
    if (page) { response.page = page; response.limit = limit; }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET MY EVENTS
========================= */

const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      createdBy: req.user.id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET ALL EVENTS (ADMIN)
========================= */

const getAllEvents = async (req, res, next) => {
  try {
    const { status, approvalStatus } = req.query;

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    let query = Event.find(filter).sort({ createdAt: -1 });

    const { paginatedQuery, page, limit } = paginate(query, req);
    const events = await paginatedQuery;

    const response = {
      success: true,
      count: events.length,
      data: events,
    };
    if (page) { response.page = page; response.limit = limit; }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET SOFT DELETED EVENTS
========================= */

const getSoftDeletedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isDeleted: true }).sort({
      deletedAt: -1,
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   REGISTER FOR EVENT
   POST /api/v1/events/:id/register
========================= */

const registerEvent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const event = await Event.findById(req.params.id);

    // 1. Event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // 2. Soft delete check
    if (event.isDeleted) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // 3. Lifecycle check — published only
    if (event.status !== "published") {
      return res.status(400).json({
        success: false,
        error: "Registration is only allowed for published events",
      });
    }

    // 4. Check for existing registration
    const existing = await Registration.findOne({ eventId: event._id, userId });

    if (existing && existing.status === "registered") {
      return res.status(400).json({
        success: false,
        error: "You are already registered for this event",
      });
    }

    // 5. Capacity check
    if (event.capacity !== null && event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        error: "Event is at full capacity",
      });
    }

    // 6. Eligibility check — only runs if event has requirements
    const reqs = event.requirements;
    const hasRequirements =
      reqs &&
      (
        (reqs.departments && reqs.departments.length > 0) ||
        (reqs.semesters && reqs.semesters.length > 0) ||
        (reqs.years && reqs.years.length > 0) ||
        reqs.minCgpa !== null ||
        (reqs.skills && reqs.skills.length > 0)
      );

    if (hasRequirements) {
      // Fetch student profile — only fields needed for eligibility
      const student = await User.findById(userId).select(
        "department semester year cgpa skills"
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      const result = checkEligibility(student, reqs);

      if (!result.eligible) {
        if (result.reason === "incomplete") {
          return res.status(400).json({
            success: false,
            error: `Profile incomplete. Please update your ${result.field} in your profile before registering.`,
          });
        }
        return res.status(403).json({
          success: false,
          error: "You are not eligible for this event",
        });
      }
    }

    // 7. Register — create or re-activate
    if (existing && existing.status === "cancelled") {
      existing.status = "registered";
      existing.registeredAt = new Date();
      existing.cancelledAt = null;
      await existing.save();
    } else {
      await Registration.create({
        eventId: event._id,
        userId,
        status: "registered",
        registeredAt: new Date(),
      });
    }

    // 8. Increment registeredCount
    event.registeredCount = Math.max(0, event.registeredCount) + 1;
    await event.save();

    return res.status(201).json({
      success: true,
      message: "Successfully registered for event",
      registeredCount: event.registeredCount,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CANCEL REGISTRATION
   DELETE /api/v1/events/:id/register
========================= */

const cancelRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const event = await Event.findById(req.params.id);

    // 1. Event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // 2. Soft delete check
    if (event.isDeleted) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // 3. Find registration
    const registration = await Registration.findOne({
      eventId: event._id,
      userId,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "You are not registered for this event",
      });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: "Your registration is already cancelled",
      });
    }

    // 4. Cancel registration
    registration.status = "cancelled";
    registration.cancelledAt = new Date();
    await registration.save();

    // 5. Decrement registeredCount — never below 0
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      registeredCount: event.registeredCount,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET EVENT ATTENDEES
   GET /api/v1/events/:id/attendees
   Organizer (own event) or Admin
========================= */

const getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    // 1. Event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // 2. Soft delete check
    if (event.isDeleted) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // 3. Ownership check — organizer must own event, admin bypasses
    if (
      req.user.role === "organizer" &&
      event.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: You do not own this event",
      });
    }

    // 4. Fetch active registrations only
    const registrations = await Registration.find({
      eventId: event._id,
      status: "registered",
    })
      .populate("userId", "name email enrollmentId")
      .sort({ registeredAt: 1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      capacity: event.capacity ?? "Unlimited",
      registeredCount: event.registeredCount,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  updateEvent,
  changeEventStatus,
  approveEvent,
  softDeleteEvent,
  restoreEvent,
  permanentDeleteEvent,
  toggleInterest,
  registerEvent,
  cancelRegistration,
  getEventAttendees,
  getPublishedEvents,
  getSingleEvent,
  getArchivedEvents,
  getMyEvents,
  getAllEvents,
  getSoftDeletedEvents,
};