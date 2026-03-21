const Event = require("../models/Event");

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
   CREATE EVENT
========================= */

const createEvent = async (req, res, next) => {
  try {
    // Guard — req.user must be set by protect middleware
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

module.exports = {
  createEvent,
  updateEvent,
  changeEventStatus,
  approveEvent,
  softDeleteEvent,
  restoreEvent,
  permanentDeleteEvent,
  getPublishedEvents,
  getSingleEvent,
  getArchivedEvents,
  getMyEvents,
  getAllEvents,
  getSoftDeletedEvents,
};