const express = require("express");
const router = express.Router();
const pool = require("../../config/db");


router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error fetching categories" });
  }
});

module.exports = router;
