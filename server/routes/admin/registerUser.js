// routes/admin/registerUser.js
const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

/**
 * ----------------------------------------------------------------
 * Admin-only registration for city-clerks and admins
 * ----------------------------------------------------------------
 */
router.post(
  "/",
  auth, // Must be logged in
  [
    body("full_name").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["admin", "city-clerk"])
      .withMessage("Role must be either 'admin' or 'city-clerk'"),
    body("phone_number")
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^\+?\d{10,15}$/)
      .withMessage("Phone number must be valid"),
  ],
  async (req, res) => {
    try {
      // Only admin users can create city-clerks or other admins
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ msg: "Only admins can register users here" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      let { full_name, email, password, role, phone_number } = req.body;
      email = email.toLowerCase();

      // Check if user already exists
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = $1",
        [email]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const newUser = await pool.query(
        `
        INSERT INTO users (full_name, email, password, role, phone_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, full_name, email, role, phone_number
        `,
        [full_name, email, hashedPassword, role, phone_number]
      );

      res.status(201).json({
        msg: `User registered successfully as ${role}`,
        user: newUser.rows[0],
      });
    } catch (err) {
      console.error("Admin registration error:", err);
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  }
);

module.exports = router;
