const express = require("express");

const { getPublicStats } = require("../controllers/publicController");

const router = express.Router();

/* =========================
   PUBLIC — no auth required
========================= */

router.get("/stats", getPublicStats);

module.exports = router;
