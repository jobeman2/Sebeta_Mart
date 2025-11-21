const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// CREATE NEW ORDER
router.post("/", auth, async (req, res) => {
  try {
    const user = req.user; // logged-in user from auth middleware
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Fetch product info (price + seller_id)
    const productQuery = await pool.query(
      "SELECT price, seller_id FROM products WHERE id = $1",
      [product_id]
    );

    if (productQuery.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    const product = productQuery.rows[0];

    // Prevent ordering own product
    if (user.id === product.seller_id) {
      return res.status(403).json({ message: "You cannot order your own product." });
    }

    const total_price = Number(product.price) * Number(quantity);

    // Insert order
    const result = await pool.query(
      `
      INSERT INTO orders (product_id, seller_id, user_id, quantity, total_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [product_id, product.seller_id, user.id, quantity, total_price]
    );

    res.status(201).json({
      message: "Order created successfully.",
      order: result.rows[0],
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error creating order." });
  }
});

module.exports = router;
