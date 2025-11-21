const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subcategories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    res.status(500).json({ message: "Server error fetching subcategories" });
  }
});

module.exports = router;
