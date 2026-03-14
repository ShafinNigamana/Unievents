const { validateTransition } = require("../utils/lifecycleValidator");

const validateLifecycle = (req, res, next) => {
  const event = req.event;
  const { status } = req.body;

  if (!validateTransition(event.status, status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid lifecycle transition from ${event.status} to ${status}`,
    });
  }

  if (event.status === "archived" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Archived events are immutable",
    });
  }

  next();
};

module.exports = { validateLifecycle };