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

    // Fetch orders with buyer info and product info
    const ordersResult = await pool.query(
      `SELECT 
         o.id AS order_id,
         o.user_id AS buyer_id,
         u.full_name AS buyer_name,
         u.email AS buyer_email,
    
         o.product_id,
         p.name AS product_name,
         p.price AS product_price,
    
         -- Updated to use image_url1
         CASE 
           WHEN p.image_url1 IS NOT NULL AND p.image_url1 <> '' 
           THEN CONCAT('http://localhost:5000/', p.image_url1) 
           ELSE NULL 
         END AS product_image,
    
         o.quantity,
         o.total_price,
         o.status,
         o.created_at
       FROM orders o
       INNER JOIN products p ON o.product_id = p.id
       INNER JOIN users u ON o.user_id = u.id
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
