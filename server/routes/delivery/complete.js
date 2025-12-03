const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

/*
|---------------------------------------------------------------------------
| GET assigned orders for the delivery person
|---------------------------------------------------------------------------
| Returns all orders that are assigned to the logged-in delivery person
*/
router.get("/", auth, async (req, res) => {
  const deliveryId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
         o.id AS order_id,
         o.user_id,
         o.product_id,
         o.seller_id,
         o.quantity,
         o.total_price,
         o.status,
         o.delivery_id,
         u.full_name AS customer_name,
         u.phone_number AS customer_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.delivery_id = $1
       ORDER BY o.id ASC`,
      [deliveryId]
    );

    res.json({ orders: result.rows });
  } catch (err) {
    console.error("Error fetching assigned orders:", err);
    res.status(500).json({ message: "Server error fetching assigned orders" });
  }
});

/*
|---------------------------------------------------------------------------
| PATCH: Mark an order as delivered
|---------------------------------------------------------------------------
*/
router.patch("/", auth, async (req, res) => {
  const { order_id } = req.body;
  const deliveryId = req.user.id;

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = 'delivered'
       WHERE id = $1 AND delivery_id = $2
       RETURNING *`,
      [order_id, deliveryId]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: "Order not found or not assigned to you" });
    }

    res.json({ message: "Order marked as delivered", order: result.rows[0] });
  } catch (err) {
    console.error("Error marking order as delivered:", err);
    res.status(500).json({ message: "Server error marking order as delivered" });
  }
});

module.exports = router;
