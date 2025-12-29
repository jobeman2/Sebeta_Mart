// routes/admin/delivery_profiles.js
const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

/**
 * Role-based access control
 */
const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    next();
  };

/**
 * GET all delivery profiles (admin, city-clerk, super_admin)
 */
router.get(
  "/",
  auth,
  allowRoles("admin", "city-clerk", "super_admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          dp.id,
          dp.user_id,
          dp.vehicle_type,
          dp.plate_number,
          dp.license_number,
          dp.profile_image,
          dp.national_id,
          dp.id_card_image,
          dp.status,
          u.full_name,
          u.email,
          u.phone_number
        FROM delivery_profiles dp
        JOIN users u ON dp.user_id = u.id
        ORDER BY dp.id
      `);

      res.json({ delivery_profiles: result.rows });
    } catch (err) {
      console.error("Fetch delivery_profiles error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * GET single delivery profile by ID
 */
router.get(
  "/:id",
  auth,
  allowRoles("admin", "city-clerk", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `
        SELECT 
          dp.id,
          dp.user_id,
          dp.vehicle_type,
          dp.plate_number,
          dp.license_number,
          dp.profile_image,
          dp.national_id,
          dp.id_card_image,
          dp.status,
          u.full_name,
          u.email,
          u.phone_number
        FROM delivery_profiles dp
        JOIN users u ON dp.user_id = u.id
        WHERE dp.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ msg: "Delivery profile not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Fetch delivery profile error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * PATCH update delivery profile status (verify/unverify)
 */
router.patch(
  "/:id/status",
  auth,
  allowRoles("admin", "city-clerk", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = ["pending", "approved", "rejected", "suspended"];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({
            msg: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
          });
      }

      const result = await pool.query(
        `
        UPDATE delivery_profiles
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ msg: "Delivery profile not found" });
      }

      res.json({
        msg: `Delivery profile status updated to ${status}`,
        delivery_profile: result.rows[0],
      });
    } catch (err) {
      console.error("Update delivery profile status error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
