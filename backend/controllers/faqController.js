const FAQ = require("../models/FAQ");

/* =========================
   GET ALL FAQs (Public)
========================= */

const getFAQs = async (req, res, next) => {
  try {
    // Only show active FAQs to public users
    const filter = { isActive: true };

    // Optional category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Sort: newest (default) or oldest
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;

    const faqs = await FAQ.find(filter).sort({
      category: 1,
      createdAt: sortOrder,
    });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CREATE FAQ (Admin)
========================= */

const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, isActive } = req.body;

    const faq = await FAQ.create({
      question,
      answer,
      category: category || "General",
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   UPDATE FAQ (Admin)
========================= */

const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: "FAQ not found",
      });
    }

    if (req.body.question !== undefined) faq.question = req.body.question;
    if (req.body.answer !== undefined) faq.answer = req.body.answer;
    if (req.body.category !== undefined) faq.category = req.body.category;
    if (req.body.isActive !== undefined) faq.isActive = req.body.isActive;

    await faq.save();

    res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DELETE FAQ (Admin)
========================= */

const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: "FAQ not found",
      });
    }

    await faq.deleteOne();

    res.status(200).json({
      success: true,
      message: "FAQ deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
