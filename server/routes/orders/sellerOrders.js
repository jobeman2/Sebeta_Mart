const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth"); // attaches req.user

// GET orders for the logged-in seller
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get seller_id for this user
    const sellerResult = await pool.query(
      "SELECT id FROM sellers WHERE user_id = $1",
      [userId]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const sellerId = sellerResult.rows[0].id;

    // Fetch orders for this seller
    const ordersResult = await pool.query(
      `SELECT 
         o.id AS order_id,
         o.product_id,
         o.seller_id,
         o.user_id AS buyer_id,
         o.quantity,
         o.total_price,
         o.status,
         o.created_at,
         p.name AS product_name,
         p.price AS product_price
       FROM orders o
       INNER JOIN products p ON o.product_id = p.id
       WHERE o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [sellerId]
    );

    res.json(ordersResult.rows);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error fetching seller orders" });
  }
});

module.exports = router;
