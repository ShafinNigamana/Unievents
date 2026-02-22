const Event = require("../models/Event");

const checkOwnership = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // Admin bypass
    if (req.user.role === "admin") {
      req.event = event;
      return next();
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: You do not own this event",
      });
    }

    req.event = event;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkOwnership };