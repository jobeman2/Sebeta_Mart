const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// -----------------------------
// ADD TO FAVORITES
// -----------------------------
router.post("/add", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const exists = await pool.query(
      "SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    if (exists.rows.length > 0) {
      return res.json({ message: "Already in favorites" });
    }

    await pool.query(
      "INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)",
      [user_id, product_id]
    );

    res.status(201).json({ message: "Added to favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// REMOVE FROM FAVORITES
// -----------------------------
router.delete("/remove", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID required" });
    }

    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// GET USER FAVORITES
// -----------------------------
router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const favs = await pool.query(
      `SELECT f.product_id, p.name, p.price, p.image_url1
       FROM favorites f
       JOIN products p ON p.id = f.product_id
       WHERE f.user_id = $1`,
      [user_id]
    );

    res.json(favs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// GET FAVORITES COUNT
// -----------------------------
router.get("/count", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      "SELECT COUNT(*) FROM favorites WHERE user_id = $1",
      [user_id]
    );

    const count = parseInt(result.rows[0].count, 10);

    res.status(200).json({ count });
  } catch (err) {
    console.error("Favorites count error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
