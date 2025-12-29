// routes/admin/buyers.js
const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// GET all buyers (admin and city-clerk)
router.get("/", auth, async (req, res) => {
  const { role } = req.user;

  // Allow both admin and city-clerk roles
  if (role !== "admin" && role !== "city-clerk") {
    return res.status(403).json({ msg: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      "SELECT id, full_name, email, phone_number FROM users WHERE role = 'buyer' ORDER BY id ASC"
    );
    res.json({ buyers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;