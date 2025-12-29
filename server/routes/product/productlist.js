const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// GET all products with seller info
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        s.shop_name AS seller_name,
        s.shop_logo AS seller_image,
        s.is_verified AS seller_verified
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
    `;

    const result = await pool.query(query);

    const products = result.rows.map((p) => {
      ["image_url1", "image_url2", "image_url3"].forEach((key) => {
        if (p[key]) {
          p[key] = `http://localhost:5000/${p[key].replace(/\\/g, "/")}`;
        }
      });

      if (p.seller_image) {
        p.seller_image = `http://localhost:5000/${p.seller_image.replace(/\\/g, "/")}`;
      }

      // Fallback for missing seller info
      if (!p.seller_name) p.seller_name = "Unknown Seller";
      if (p.seller_verified === null) p.seller_verified = false;

      return p;
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching products." });
  }
});

module.exports = router;
