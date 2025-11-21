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

    const products = result.rows.map(p => {
      // normalize image paths
      ["image_url1", "image_url2", "image_url3"].forEach(key => {
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

// CREATE product
router.post("/", upload.array("images", 3), async (req, res) => {
  try {
    const {
      seller_id,
      name,
      description,
      price,
      stock,
      category_id,
      subcategory_id,
      brand_id,
      usage,
      status,
    } = req.body;

    if (!seller_id || !name || !price) {
      return res.status(400).json({ message: "Seller ID, name, and price are required." });
    }

    const sellerIdNum = parseInt(seller_id, 10);

    // handle multiple images
    const imagePaths = req.files
      ? req.files.map(file => path.join("uploads", "products", sellerIdNum.toString(), file.filename).replace(/\\/g, "/"))
      : [];

    const insertQuery = `
      INSERT INTO products
        (seller_id, name, description, price, stock, category_id, subcategory_id, brand_id,
         image_url1, image_url2, image_url3, usage, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;

    const values = [
      sellerIdNum,
      name,
      description || "",
      price,
      stock || 0,
      category_id || null,
      subcategory_id || null,
      brand_id || null,
      imagePaths[0] || null,
      imagePaths[1] || null,
      imagePaths[2] || null,
      usage || "",
      status || "active",
    ];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating product." });
  }
});

module.exports = router;
