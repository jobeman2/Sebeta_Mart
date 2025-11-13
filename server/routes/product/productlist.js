const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// GET all products (for frontend listing)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");

    const products = result.rows.map(p => {
      ["image_url", "image_url1", "image_url2", "image_url3"].forEach(key => {
        if (p[key]) p[key] = p[key].replace(/\\/g, "/");
      });
      return p;
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching products." });
  }
});

module.exports = router;
