const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const upload = require("../../middleware/upload");
const path = require("path");

// GET all products for a seller
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId, 10);

    const result = await pool.query("SELECT * FROM products WHERE seller_id=$1", [sellerId]);

    // Convert image paths to relative URLs for frontend
    const products = result.rows.map(p => {
      if (p.image_url) {
        p.image_url = p.image_url.replace(/\\/g, "/"); // fix Windows backslashes
      }
      return p;
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching products." });
  }
});

// CREATE product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { seller_id, name, description, price, stock } = req.body;

    if (!seller_id || !name || !price) {
      return res.status(400).json({ message: "Seller ID, name, and price are required." });
    }

    const sellerIdNum = parseInt(seller_id, 10);

    const imagePath = req.file
      ? path.join("uploads", "products", sellerIdNum.toString(), req.file.filename).replace(/\\/g, "/")
      : null;

    const insertQuery = `
      INSERT INTO products (seller_id, name, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [sellerIdNum, name, description || "", price, stock || 0, imagePath];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating product." });
  }
});

module.exports = router;
