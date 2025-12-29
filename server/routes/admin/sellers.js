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
 * ------------------------------------------------------------------
 * GET all sellers (admin, city-clerk)
 * ------------------------------------------------------------------
 */
router.get(
  "/",
  auth,
  allowRoles("admin", "city-clerk", "super_admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          s.id,
          s.user_id,
          u.full_name,
          u.email,
          u.phone_number,
          s.is_verified,
          s.shop_name,
          s.shop_description,
          s.shop_address,
          s.business_license,
          s.government_id,
          s.national_id_number
        FROM sellers s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.id
      `);

      let sellers = result.rows;

      // Hide sensitive documents from city-clerks
      if (req.user.role === "city-clerk") {
        sellers = sellers.map((s) => ({
          ...s,
          business_license: null,
          government_id: null,
        }));
      }

      res.json({ sellers });
    } catch (err) {
      console.error("Fetch sellers error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * ------------------------------------------------------------------
 * GET single seller by ID (admin, city-clerk)
 * ------------------------------------------------------------------
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
          s.id,
          s.user_id,
          u.full_name,
          u.email,
          u.phone_number,
          s.is_verified,
          s.shop_name,
          s.shop_description,
          s.shop_address,
          s.business_license,
          s.government_id,
          s.national_id_number
        FROM sellers s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ msg: "Seller not found" });
      }

      let seller = result.rows[0];

      // Hide sensitive documents from city-clerks
      if (req.user.role === "city-clerk") {
        seller.business_license = null;
        seller.government_id = null;
      }

      res.json(seller);
    } catch (err) {
      console.error("Fetch seller error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * ------------------------------------------------------------------
 * PATCH verify / unverify seller (admin, city-clerk)
 * ------------------------------------------------------------------
 */
router.patch(
  "/:id/verify",
  auth,
  allowRoles("admin", "city-clerk", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { verify } = req.body;

      if (typeof verify !== "boolean") {
        return res.status(400).json({ msg: "`verify` must be boolean" });
      }

      const result = await pool.query(
        `
        UPDATE sellers
        SET is_verified = $1
        WHERE id = $2
        RETURNING *
        `,
        [verify, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ msg: "Seller not found" });
      }

      res.json({
        msg: `Seller ${verify ? "verified" : "unverified"} successfully`,
        seller: result.rows[0],
      });
    } catch (err) {
      console.error("Verify seller error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
