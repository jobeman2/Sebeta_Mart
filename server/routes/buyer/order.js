const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// --------------------------------------------------
// GET all orders for logged-in buyer
// --------------------------------------------------
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

        (
          SELECT latitude
          FROM order_tracking
          WHERE order_id = o.id
          ORDER BY updated_at DESC
          LIMIT 1
        ) AS delivery_latitude,

        (
          SELECT longitude
          FROM order_tracking
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

// --------------------------------------------------
// POST buyer confirms delivery
// --------------------------------------------------
router.post("/:orderId/buyer-confirm", auth, async (req, res) => {
  const buyerId = req.user.id;
  const { orderId } = req.params;

  try {
    // Make sure order belongs to buyer and is delivered
    const orderCheck = await pool.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = $1 AND user_id = $2
      `,
      [orderId, buyerId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderCheck.rows[0].status !== "delivered") {
      return res.status(400).json({
        message: "Order cannot be confirmed before delivery",
      });
    }

    // Update status
    await pool.query(
      `
      UPDATE orders
      SET status = 'buyer_confirmed'
      WHERE id = $1
      `,
      [orderId]
    );

    res.json({
      success: true,
      message: "Delivery confirmed successfully",
    });
  } catch (err) {
    console.error("Error confirming delivery:", err);
    res.status(500).json({ message: "Server error confirming delivery" });
  }
});

module.exports = router;
