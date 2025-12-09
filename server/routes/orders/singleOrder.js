const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// ------------------------------------------
// GET single order details with delivery users
// ------------------------------------------
router.get("/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Fetch order details
    const result = await pool.query(
      `SELECT 
         o.id AS order_id,
         o.user_id AS buyer_id,
         u.full_name AS buyer_name,
         u.email AS buyer_email,
         u.phone_number AS buyer_phone,

         o.product_id,
         p.name AS product_name,
         p.description AS product_description,
         p.price AS product_price,
         p.seller_id AS seller_id,

         CASE 
           WHEN p.image_url1 IS NOT NULL AND p.image_url1 <> '' 
           THEN CONCAT('http://localhost:5000/', REPLACE(p.image_url1, '\\', '/'))
           ELSE NULL
         END AS product_image,

         o.quantity,
         o.total_price,

         o.status,
         o.payment_method,
         o.payment_status,
         o.telebirr_txn_number,

         CASE
           WHEN o.telebirr_screenshot IS NOT NULL AND o.telebirr_screenshot <> '' 
           THEN CONCAT('http://localhost:5000/', REPLACE(o.telebirr_screenshot, '\\', '/'))
           ELSE NULL
         END AS telebirr_screenshot,

         o.delivery_id,
         o.created_at
       FROM orders o
       INNER JOIN products p ON o.product_id = p.id
       INNER JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = result.rows[0];

    // Return delivery users
    const deliveryUsersRes = await pool.query(
      `SELECT u.id AS delivery_id, u.full_name, u.email, dp.latitude, dp.longitude
       FROM delivery_profiles dp
       INNER JOIN users u ON dp.user_id = u.id
       WHERE u.role = 'delivery'`
    );

    res.json({ order, deliveryUsers: deliveryUsersRes.rows });
  } catch (error) {
    console.error("Error fetching single order:", error);
    res.status(500).json({
      message: "Server error fetching order",
      error: error.message,
    });
  }
});

// ------------------------------------------
// ASSIGN DELIVERY - NO STRING CONVERSION
// ------------------------------------------
router.patch("/:id/assign-delivery", auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { delivery_id } = req.body;

    // Validate input
    if (!delivery_id && delivery_id !== 0) {
      return res.status(400).json({ message: "Delivery person ID is required" });
    }

    // Fetch order
    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const order = orderRes.rows[0];

    // Only allow if payment is confirmed
    if (order.payment_status !== "payment_confirmed") {
      return res.status(400).json({ message: "Payment must be confirmed before assigning delivery" });
    }

    // Check if already assigned
    if (order.delivery_id) {
      return res.status(400).json({ message: "Delivery person already assigned" });
    }

    // Verify delivery person exists
    const deliveryRes = await pool.query(
      `SELECT u.id
       FROM users u
       INNER JOIN delivery_profiles dp ON dp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'delivery'`,
      [delivery_id] // Use the number directly
    );

    if (deliveryRes.rows.length === 0) {
      return res.status(404).json({ message: "Delivery person not found" });
    }

    // Assign delivery person - store as INTEGER
    const update = await pool.query(
      `UPDATE orders
       SET delivery_id = $1,
           status = 'assigned_for_delivery'
       WHERE id = $2
       RETURNING *`,
      [delivery_id, orderId]  // Send as number (no string conversion)
    );

    res.json({ 
      message: "Delivery person assigned successfully", 
      order: update.rows[0] 
    });
  } catch (error) {
    console.error("Error assigning delivery person:", error);
    
    // If you still get VARCHAR error, then your database column is NOT INTEGER
    if (error.code === '22001') {
      return res.status(400).json({ 
        message: "Database error: delivery_id column is VARCHAR(20), not INTEGER",
        hint: "You need to alter the column type: ALTER TABLE orders ALTER COLUMN delivery_id TYPE INTEGER USING delivery_id::integer;"
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      code: error.code
    });
  }
});

// ------------------------------------------
// CONFIRM PAYMENT (SELLER ACTION)
// ------------------------------------------
router.patch("/confirm-payment/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const order = orderRes.rows[0];

    if (order.payment_method !== "telebirr" || !order.telebirr_txn_number) {
      return res.status(400).json({ message: "Telebirr payment with transaction number required" });
    }

    if (order.payment_status === "payment_confirmed") {
      return res.status(400).json({ message: "Payment already confirmed" });
    }

    const update = await pool.query(
      `UPDATE orders
       SET payment_status = 'payment_confirmed',
           status = 'ready_for_delivery'
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );

    res.json({ message: "Payment confirmed successfully", order: update.rows[0] });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Server error confirming payment", error: error.message });
  }
});

module.exports = router;