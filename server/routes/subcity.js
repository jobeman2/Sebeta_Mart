// routes/subcity.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // adjust path if needed

// GET /subcities
// Fetch all subcities from the database
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM subcities ORDER BY name ASC");
    res.json({ subcities: result.rows });
  } catch (err) {
    console.error("Error fetching subcities:", err);
    res.status(500).json({ message: "Server error fetching subcities." });
  }
});

module.exports = router;
