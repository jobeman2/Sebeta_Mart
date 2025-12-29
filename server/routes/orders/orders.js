const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const multer = require("multer");

// Proper multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/telebirr/");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "." + ext); // always include extension
  }
});

const upload = multer({ storage });

router.post("/", auth, upload.single("screenshot"), async (req, res) => {
  try {
    const user = req.user;
    const {
      product_id,
      quantity,
      region,
      city,
      subcity_id,
      latitude,
      longitude,
      payment_method,
      telebirr_txn_number,
    } = req.body;

    if (!product_id || !quantity || !region || !city || !subcity_id || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const productQuery = await pool.query(
      "SELECT price, seller_id FROM products WHERE id = $1",
      [product_id]
    );

    if (productQuery.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    const product = productQuery.rows[0];

    if (user.id === product.seller_id) {
      return res.status(403).json({ message: "You cannot order your own product." });
    }

    const total_price = Number(product.price) * Number(quantity);

    let paymentStatus = "pending";
    let screenshotPath = null;

    if (payment_method === "telebirr") {
      if (!telebirr_txn_number) {
        return res.status(400).json({ message: "Transaction number is required for TeleBirr." });
      }

      paymentStatus = "completed";

      if (req.file) {
        screenshotPath = `uploads/telebirr/${req.file.filename}`; // FIXED
      }
    }

    const result = await pool.query(
      `
      INSERT INTO orders 
      (product_id, seller_id, user_id, quantity, total_price, region, city, subcity_id, latitude, longitude, payment_method, payment_status, telebirr_txn_number, telebirr_screenshot)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *;
      `,
      [
        product_id,
        product.seller_id,
        user.id,
        quantity,
        total_price,
        region,
        city,
        Number(subcity_id),
        latitude,
        longitude,
        payment_method || "cod",
        paymentStatus,
        telebirr_txn_number || null,
        screenshotPath,
      ]
    );

    res.status(201).json({
      message: "Order created successfully.",
      order: result.rows[0],
    });

  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error creating order." });
  }
});

module.exports = router;
