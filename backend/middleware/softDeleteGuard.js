const preventIfSoftDeleted = (req, res, next) => {
  if (req.event.isDeleted) {
    return res.status(400).json({
      success: false,
      error: "This event is soft-deleted",
    });
  }
  next();
};

module.exports = { preventIfSoftDeleted };