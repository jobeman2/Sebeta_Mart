const express = require("express");
const router = express.Router();
const pool = require("../../config/db"); // your Postgres pool

// GET seller info by user_id
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM sellers WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new seller/shop
router.post("/", async (req, res) => {
  const {
    user_id,
    shop_name,
    shop_description,
    shop_address,
    business_license,
    government_id,
    national_id_number
  } = req.body;

  if (!user_id || !shop_name) {
    return res.status(400).json({ message: "User ID and Shop Name are required" });
  }

  try {
    // Check if seller already exists
    const exists = await pool.query("SELECT * FROM sellers WHERE user_id = $1", [user_id]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Shop already exists for this user" });
    }

    const result = await pool.query(
      `INSERT INTO sellers 
        (user_id, shop_name, shop_description, shop_address, business_license, government_id, national_id_number, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       RETURNING *`,
      [
        user_id,
        shop_name,
        shop_description || "",
        shop_address || "",
        business_license || "",
        government_id || "",
        national_id_number || ""
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
