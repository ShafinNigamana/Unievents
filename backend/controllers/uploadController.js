const uploadEventPoster = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    res.status(200).json({
      success: true,
      posterUrl: req.file.path,
      posterPublicId: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadEventPoster };
