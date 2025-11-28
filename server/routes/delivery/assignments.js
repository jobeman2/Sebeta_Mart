const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

/**
 * GET /delivery/assignments
 * Fetch all unassigned orders for delivery
 */
router.get("/assignments", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
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
      WHERE o.status = 'pending' AND o.delivery_id IS NULL
      ORDER BY o.user_id
    `);

    res.json({ orders: result.rows });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ message: "Server error fetching assignments" });
  }
});

/**
 * PATCH /delivery/assign/:orderId
 * Assign a delivery person to an order
 */
router.patch("/assign/:orderId", auth, async (req, res) => {
  const { orderId } = req.params;
  const deliveryId = req.user.id; // Logged-in delivery user

  try {
    const update = await pool.query(
      `UPDATE orders
       SET delivery_id = $1, status = 'assigned'
       WHERE product_id = $2 AND delivery_id IS NULL
       RETURNING *`,
      [deliveryId, orderId]
    );

    if (!update.rows.length) {
      return res
        .status(400)
        .json({ message: "Order not found or already assigned" });
    }

    res.json({ message: "Order assigned successfully", order: update.rows[0] });
  } catch (err) {
    console.error("Error assigning order:", err);
    res.status(500).json({ message: "Server error assigning order" });
  }
});

module.exports = router;
