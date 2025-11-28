const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

router.get("/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    const result = await pool.query(
      `SELECT 
         o.id AS order_id,
         o.user_id AS buyer_id,
         u.full_name AS buyer_name,
         u.email AS buyer_email,
         u.phone_number AS buyer_phone,   -- fetch phone from users table

         o.product_id,
         p.name AS product_name,
         p.description AS product_description,
         p.price AS product_price,

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
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error fetching single order:", error);
    res.status(500).json({ message: "Server error fetching order", error: error.message });
  }
});

module.exports = router;
