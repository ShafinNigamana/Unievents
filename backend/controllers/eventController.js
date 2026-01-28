const Event = require("../models/Event");

// POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, category, status } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      category,
      status,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Event not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Event not found" });

    res.json({ message: "Event deleted ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent };
