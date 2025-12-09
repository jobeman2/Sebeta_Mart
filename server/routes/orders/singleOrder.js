const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// ------------------------------------------
// GET single order details
// ------------------------------------------
router.get("/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

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

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching single order:", error);
    res.status(500).json({
      message: "Server error fetching order",
      error: error.message
    });
  }
});

// ------------------------------------------
// CONFIRM PAYMENT (SELLER ACTION)
// ------------------------------------------
router.patch("/confirm-payment/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Fetch order
    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0) return res.status(404).json({ message: "Order not found" });
    const order = orderRes.rows[0];

    // Fetch product to verify seller
    const productRes = await pool.query(`SELECT seller_id FROM products WHERE id = $1`, [order.product_id]);
    const product = productRes.rows[0];

    if (req.user.id !== product.seller_id) {
      return res.status(403).json({ message: "Only the seller can confirm payment" });
    }

    if (order.payment_status === "completed") {
      return res.status(400).json({ message: "Payment already confirmed" });
    }

    // Update payment status
    const update = await pool.query(
      `UPDATE orders
       SET payment_status = 'completed',
           status = 'payment_confirmed'
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
  