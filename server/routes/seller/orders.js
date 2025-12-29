const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// GET all orders for the logged-in seller
router.get("/", auth, async (req, res) => {
  const sellerUserId = req.user.id;

  try {
    // Get seller_id from sellers table
    const sellerResult = await pool.query(
      "SELECT id FROM sellers WHERE user_id = $1",
      [sellerUserId]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(400).json({ message: "Seller profile not found" });
    }

    const sellerId = sellerResult.rows[0].id;

    // Fetch all orders that belong to this seller
    const result = await pool.query(
      `
      SELECT 
        o.id AS order_id,
        o.user_id AS buyer_id,
        u.full_name AS buyer_name,
        u.phone_number AS buyer_phone,
        o.product_id,
        o.quantity,
        o.total_price,
        o.status,
        o.delivery_id,
        
        -- Delivery person info
        du.full_name AS delivery_name,
        du.phone_number AS delivery_phone,
        dp.vehicle_type,
        dp.plate_number

      FROM orders o

      -- Buyer join
      LEFT JOIN users u ON o.user_id = u.id

      -- Delivery person join
      LEFT JOIN users du ON o.delivery_id = du.id
      LEFT JOIN delivery_profiles dp ON o.delivery_id = dp.user_id

      WHERE o.seller_id = $1
      ORDER BY o.id DESC
      `,
      [sellerId]
    );

    res.json({ orders: result.rows });
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

module.exports = router;
