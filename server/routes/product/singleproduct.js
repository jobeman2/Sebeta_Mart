const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const result = await pool.query(
      `SELECT * FROM products WHERE id = $1`,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = result.rows[0];

    // Normalize slashes only
    ["image_url1", "image_url2", "image_url3"].forEach(key => {
      if (product[key]) product[key] = product[key].replace(/\\/g, "/");
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching product." });
  }
});

module.exports = router;
