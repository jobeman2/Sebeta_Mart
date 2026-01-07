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

    const result = await pool.query(
      `SELECT 
         -- ORDER
         o.id AS order_id,
         o.quantity,
         o.total_price,
         o.status,
         o.payment_method,
         o.payment_status,
         o.telebirr_txn_number,
         o.created_at,

         -- BUYER INFO
         o.user_id AS buyer_id,
         u.full_name AS buyer_name,
         u.email AS buyer_email,
         u.phone_number AS buyer_phone,

         -- PRODUCT INFO
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

         -- PAYMENT IMAGE
         CASE
           WHEN o.telebirr_screenshot IS NOT NULL AND o.telebirr_screenshot <> '' 
           THEN CONCAT('http://localhost:5000/', REPLACE(o.telebirr_screenshot, '\\', '/'))
           ELSE NULL
         END AS telebirr_screenshot,

         -- DELIVERY (ASSIGNED PERSON INFO)
         o.delivery_id,
         du.full_name AS delivery_person_name,
         du.email AS delivery_person_email,
         du.phone_number AS delivery_person_phone,
         dp2.latitude AS delivery_latitude,
         dp2.longitude AS delivery_longitude

       FROM orders o
       INNER JOIN products p ON o.product_id = p.id
       INNER JOIN users u ON o.user_id = u.id
       LEFT JOIN users du ON o.delivery_id = du.id
       LEFT JOIN delivery_profiles dp2 ON dp2.user_id = du.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // LIST OF DELIVERY USERS (FOR ASSIGNING)
    const deliveryUsersRes = await pool.query(
      `SELECT 
         u.id AS delivery_id,
         u.full_name,
         u.email,
         u.phone_number,
         dp.latitude,
         dp.longitude
       FROM delivery_profiles dp
       INNER JOIN users u ON dp.user_id = u.id
       WHERE u.role = 'delivery'`
    );

    res.json({
      order: result.rows[0],
      deliveryUsers: deliveryUsersRes.rows,
    });
  } catch (error) {
    console.error("Error fetching single order:", error);
    res.status(500).json({ message: "Server error fetching order" });
  }
});

// ------------------------------------------
// ASSIGN DELIVERY
// ------------------------------------------
router.patch("/:id/assign-delivery", auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { delivery_id } = req.body;

    if (!delivery_id && delivery_id !== 0) {
      return res.status(400).json({ message: "Delivery person ID is required" });
    }

    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const order = orderRes.rows[0];

    if (order.payment_status !== "payment_confirmed") {
      return res.status(400).json({ message: "Payment must be confirmed first" });
    }

    if (order.delivery_id) {
      return res.status(400).json({ message: "Delivery already assigned" });
    }

    const deliveryRes = await pool.query(
      `SELECT u.id
       FROM users u
       INNER JOIN delivery_profiles dp ON dp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'delivery'`,
      [delivery_id]
    );

    if (deliveryRes.rows.length === 0) {
      return res.status(404).json({ message: "Delivery person not found" });
    }

    const update = await pool.query(
      `UPDATE orders
       SET delivery_id = $1,
           status = 'assigned_for_delivery'
       WHERE id = $2
       RETURNING *`,
      [delivery_id, orderId]
    );

    res.json({ message: "Delivery assigned", order: update.rows[0] });
  } catch (error) {
    console.error("Assign delivery error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ------------------------------------------
// CONFIRM PAYMENT
// ------------------------------------------
router.patch("/confirm-payment/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const order = orderRes.rows[0];

    if (order.payment_method !== "telebirr" || !order.telebirr_txn_number) {
      return res.status(400).json({ message: "Telebirr payment required" });
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

    res.json({ message: "Payment confirmed", order: update.rows[0] });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Server error confirming payment" });
  }
});

// ------------------------------------------
// ❌ UNDO PAYMENT CONFIRMATION (SELLER)
// ------------------------------------------
router.patch("/undo-payment/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const order = orderRes.rows[0];

    if (order.payment_status !== "payment_confirmed") {
      return res.status(400).json({ message: "Payment is not confirmed" });
    }

    const update = await pool.query(
      `UPDATE orders
       SET payment_status = 'pending',
           status = 'pending',
           delivery_id = NULL
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );

    res.json({
      message: "Payment confirmation undone successfully",
      order: update.rows[0],
    });
  } catch (error) {
    console.error("Undo payment error:", error);
    res.status(500).json({ message: "Server error undoing payment", error: error.message });
  }
});

module.exports = router;


