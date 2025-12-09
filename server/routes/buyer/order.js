const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// GET all orders for logged-in buyer
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
        u.phone_number AS delivery_phone,
        
        -- Get latest delivery location
        (
          SELECT latitude FROM order_tracking 
          WHERE order_id = o.id 
          ORDER BY updated_at DESC 
          LIMIT 1
        ) AS delivery_latitude,

        (
          SELECT longitude FROM order_tracking 
          WHERE order_id = o.id
          ORDER BY updated_at DESC
          LIMIT 1
        ) AS delivery_longitude

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
