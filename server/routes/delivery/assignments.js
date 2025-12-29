const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// Maximum distance (KM) a delivery person can see
const MAX_DISTANCE_KM = 10;

// --------------------------------------------------------------------------
// GET nearby unassigned orders
// --------------------------------------------------------------------------
router.get("/assignments", auth, async (req, res) => {
  try {
    // 1. Get delivery person's location
    const dp = await pool.query(
      `SELECT latitude, longitude 
       FROM delivery_profiles 
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (!dp.rows.length) {
      return res.status(404).json({ message: "Delivery profile not found" });
    }

    const { latitude: dLat, longitude: dLng } = dp.rows[0];

    if (dLat === null || dLng === null) {
      return res.status(400).json({
        message: "Your location is missing. Update your profile first."
      });
    }

    // 2. Calculate distance and filter orders within MAX_DISTANCE_KM
    const result = await pool.query(
      `
      WITH order_distances AS (
        SELECT 
          o.id AS order_id,
          o.user_id,
          o.product_id,
          o.seller_id,
          o.quantity,
          o.total_price,
          o.status,
          o.delivery_id,
          o.latitude,
          o.longitude,
          u.full_name AS customer_name,
          u.phone_number AS customer_phone,
          (
            6371 * acos(
              cos(radians($1::numeric)) *
              cos(radians(o.latitude::numeric)) *
              cos(radians(o.longitude::numeric) - radians($2::numeric)) +
              sin(radians($1::numeric)) *
              sin(radians(o.latitude::numeric))
            )
          ) AS distance
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = 'pending' AND o.delivery_id IS NULL
      )
      SELECT *
      FROM order_distances
      WHERE distance <= $3
      ORDER BY distance ASC;
      `,
      [dLat, dLng, MAX_DISTANCE_KM]
    );

    res.json({
      delivery_location: { latitude: dLat, longitude: dLng },
      max_distance_km: MAX_DISTANCE_KM,
      orders: result.rows
    });

  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ message: "Server error fetching assignments" });
  }
});

// --------------------------------------------------------------------------
// PATCH: Assign a delivery person to an order
// --------------------------------------------------------------------------
router.patch("/assign", auth, async (req, res) => {
  const { order_id } = req.body;
  const deliveryId = req.user.id;

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" });
  }

  try {
    const update = await pool.query(
      `UPDATE orders
       SET delivery_id = $1, status = 'assigned'
       WHERE id = $2 AND delivery_id IS NULL
       RETURNING *`,
      [deliveryId, order_id]
    );

    if (!update.rows.length) {
      return res.status(400).json({ message: "Order not found or already assigned" });
    }

    res.json({
      message: "Order assigned successfully",
      order: update.rows[0]
    });

  } catch (err) {
    console.error("Error assigning order:", err);
    res.status(500).json({ message: "Server error assigning order" });
  }
});

module.exports = router;
