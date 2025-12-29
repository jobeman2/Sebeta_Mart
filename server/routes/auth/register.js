const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

// POST /auth/register
router.post(
  "/",
  [
    body("full_name").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["buyer", "seller", "delivery"])
      .withMessage("Invalid role"),
    body("phone_number")
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^\+?\d{10,15}$/)
      .withMessage("Phone number must be valid"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    let { full_name, email, password, role, phone_number } = req.body;
    email = email.toLowerCase(); // normalize email

    try {
      // Check if user already exists
      const userExist = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = $1",
        [email]
      );
      if (userExist.rows.length > 0) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user
      const newUser = await pool.query(
        `INSERT INTO users (full_name, email, password, role, phone_number)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, full_name, email, role, phone_number`,
        [full_name, email, hashedPassword, role, phone_number]
      );

      res.status(201).json({
        msg: "User registered successfully",
        user: newUser.rows[0],
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
