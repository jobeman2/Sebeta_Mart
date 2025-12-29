const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// ------------------------------------------
// SEARCH PRODUCTS OR SELLERS
// GET /search?q=...&type=product|seller
// ------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { q, type = "product" } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // -------------------
    // PRODUCT SEARCH
    // -------------------
    if (type === "product") {
      const result = await pool.query(
        `SELECT 
           p.id,
           p.name,
           p.price,
           p.seller_id,
           CASE 
             WHEN p.image_url1 IS NOT NULL AND p.image_url1 <> '' 
             THEN CONCAT('http://localhost:5000/', REPLACE(p.image_url1, '\\', '/'))
             ELSE NULL
           END AS image
         FROM products p
         WHERE p.name ILIKE $1
         LIMIT 20`,
        [`%${q}%`]
      );

      return res.json({
        type: "product",
        count: result.rows.length,
        results: result.rows,
      });
    }

    // -------------------
    // SELLER SEARCH (from users table)
    // -------------------
    if (type === "seller") {
      const result = await pool.query(
        `SELECT 
           id,
           full_name
         FROM users
         WHERE role = 'seller' AND full_name ILIKE $1
         LIMIT 20`,
        [`%${q}%`]
      );

      return res.json({
        type: "seller",
        count: result.rows.length,
        results: result.rows,
      });
    }

    res.status(400).json({ message: "Invalid search type" });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
