// PATCH /orders/:id/assign-delivery
router.patch("/:id/assign-delivery", auth, async (req, res) => {
    try {
      const orderId = req.params.id;
      const { delivery_person_id } = req.body;
  
      if (!delivery_person_id) {
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
  
      // Optional: check if already assigned
      if (order.delivery_person_id) {
        return res.status(400).json({ message: "Delivery person already assigned" });
      }
  
      // Optional: verify delivery person exists and is delivery role
      const deliveryRes = await pool.query(
        `SELECT * FROM users WHERE id = $1 AND role = 'delivery'`,
        [delivery_person_id]
      );
      if (deliveryRes.rows.length === 0) {
        return res.status(404).json({ message: "Delivery person not found" });
      }
  
      // Assign delivery person and update order status
      const update = await pool.query(
        `UPDATE orders
         SET delivery_person_id = $1,
             status = 'assigned_for_delivery'
         WHERE id = $2
         RETURNING *`,
        [delivery_person_id, orderId]
      );
  
      res.json({ message: "Delivery person assigned successfully", order: update.rows[0] });
    } catch (error) {
      console.error("Error assigning delivery person:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  