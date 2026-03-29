const ContactMessage = require("../models/ContactMessage");

/* =========================
   CREATE CONTACT MESSAGE (Public)
========================= */

const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, subject, message)",
      });
    }

    await ContactMessage.create({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET ALL MESSAGES (Admin)
========================= */

const getAllMessages = async (req, res, next) => {
  try {
    const filter = {};

    // Optional filter by resolved status
    if (req.query.resolved === "true") filter.isResolved = true;
    if (req.query.resolved === "false") filter.isResolved = false;

    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   MARK AS RESOLVED (Admin)
========================= */

const markAsResolved = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.isResolved = true;
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DELETE MESSAGE (Admin)
========================= */

const deleteMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactMessage,
  getAllMessages,
  markAsResolved,
  deleteMessage,
};
