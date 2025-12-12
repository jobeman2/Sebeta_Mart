const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// GET all sellers (admin and city-clerk)
router.get("/", auth, async (req, res) => {
  try {
    // Allow both admin and city-clerk roles
    if (req.user.role !== "admin" && req.user.role !== "city-clerk") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const result = await pool.query(`
      SELECT s.id, u.full_name, u.email, u.phone_number, s.is_verified
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);

    res.json({ sellers: result.rows });
  } catch (err) {
    console.error("Fetch sellers error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET single seller by ID (admin and city-clerk)
router.get("/:id", auth, async (req, res) => {
  try {
    // Allow both admin and city-clerk roles
    if (req.user.role !== "admin" && req.user.role !== "city-clerk") {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    
    const { id } = req.params;

    const result = await pool.query(`
      SELECT s.id, u.full_name, u.email, u.phone_number, s.is_verified
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ msg: "Seller not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch seller error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PATCH verify/unverify seller (admin and city-clerk)
router.patch("/:id/verify", auth, async (req, res) => {
  try {
    // Allow both admin and city-clerk roles
    if (req.user.role !== "admin" && req.user.role !== "city-clerk") {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    
    const { id } = req.params;
    const { verify } = req.body; // boolean

    const result = await pool.query(
      "UPDATE sellers SET is_verified = $1 WHERE id = $2 RETURNING *",
      [verify, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ msg: "Seller not found" });

    res.json({ msg: `Seller ${verify ? "verified" : "unverified"}`, seller: result.rows[0] });
  } catch (err) {
    console.error("Verify seller error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;