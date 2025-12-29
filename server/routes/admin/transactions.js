// routes/admin/transactions.js - FIXED VERSION
const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

const TAX_RATE = 0.15; // 15% tax
const VALID_STATUSES = ["pending", "buyer_confirmed", "completed", "cancelled"];

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
 * GET all transactions
 */
router.get(
  "/",
  auth,
  allowRoles("admin", "city-clerk", "super_admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          o.id, o.user_id, o.seller_id, o.total_price, o.status, o.created_at,
          u.full_name AS buyer_name, u.email AS buyer_email, u.phone_number AS buyer_phone
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);

      const transactions = result.rows.map((tx) => {
        const totalPrice = parseFloat(tx.total_price);

        // CORRECT CALCULATION:
        // Tax = 15% of total price
        const tax = Number((totalPrice * TAX_RATE).toFixed(2));
        // Total with tax = total price + tax
        const totalWithTax = Number((totalPrice + tax).toFixed(2));

        return {
          ...tx,
          total_price: totalPrice.toFixed(2),
          tax,
          total_with_tax: totalWithTax,
        };
      });

      // Calculate summary
      const totalRevenue = transactions.reduce(
        (sum, tx) => sum + parseFloat(tx.total_price),
        0
      );
      const totalTax = transactions.reduce((sum, tx) => sum + tx.tax, 0);
      const totalWithTax = transactions.reduce(
        (sum, tx) => sum + tx.total_with_tax,
        0
      );

      const summary = {
        total_transactions: transactions.length,
        total_revenue: totalRevenue.toFixed(2),
        total_tax: totalTax.toFixed(2),
        total_with_tax: totalWithTax.toFixed(2),
        by_status: transactions.reduce((acc, tx) => {
          acc[tx.status] = (acc[tx.status] || 0) + 1;
          return acc;
        }, {}),
      };

      res.json({
        success: true,
        transactions,
        summary,
        count: transactions.length,
        tax_rate: `${TAX_RATE * 100}%`, // Show as percentage
      });
    } catch (err) {
      console.error("Fetch transactions error:", err);
      res
        .status(500)
        .json({ success: false, msg: "Server error", error: err.message });
    }
  }
);

/**
 * GET single transaction by ID
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
      SELECT o.id, o.user_id, o.seller_id, o.total_price, o.status, o.created_at,
             u.full_name AS buyer_name, u.email AS buyer_email, u.phone_number AS buyer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `,
        [id]
      );

      if (!result.rows.length)
        return res
          .status(404)
          .json({ success: false, msg: "Transaction not found" });

      const tx = result.rows[0];
      const totalPrice = parseFloat(tx.total_price);
      const tax = Number((totalPrice * TAX_RATE).toFixed(2));
      const totalWithTax = Number((totalPrice + tax).toFixed(2));

      res.json({
        success: true,
        transaction: {
          ...tx,
          total_price: totalPrice.toFixed(2),
          tax,
          total_with_tax: totalWithTax,
        },
      });
    } catch (err) {
      console.error("Fetch transaction error:", err);
      res
        .status(500)
        .json({ success: false, msg: "Server error", error: err.message });
    }
  }
);

/**
 * PATCH update transaction status
 */
router.patch(
  "/:id/status",
  auth,
  allowRoles("admin", "city-clerk", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          msg: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }

      const result = await pool.query(
        `
      UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
        [status, id]
      );

      if (!result.rows.length)
        return res
          .status(404)
          .json({ success: false, msg: "Transaction not found" });

      res.json({
        success: true,
        msg: `Transaction status updated to ${status}`,
        transaction: result.rows[0],
      });
    } catch (err) {
      console.error("Update transaction status error:", err);
      res
        .status(500)
        .json({ success: false, msg: "Server error", error: err.message });
    }
  }
);

module.exports = router;
