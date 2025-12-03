const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// GET all orders for the logged-in buyer
router.get("/", auth, async (req, res) => {
  const buyerId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT 
        o.id AS order_id,
        o.product_id,
        o.seller_id,
        o.quantity,
        o.total_price,
        o.status,
        o.delivery_id,
        dp.vehicle_type,
        u.full_name AS delivery_name,
        u.phone_number AS delivery_phone
      FROM orders o
      LEFT JOIN delivery_profiles dp ON o.delivery_id = dp.user_id
      LEFT JOIN users u ON o.delivery_id = u.id
      WHERE o.user_id = $1
      ORDER BY o.id DESC
      `,
      [buyerId]
    );

    res.json({ orders: result.rows });
  } catch (err) {
    console.error("Error fetching buyer orders:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

module.exports = router;
