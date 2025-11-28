const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const pool = require("./config/db"); // Postgres connection

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files (images in uploads folder)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/auth/register", require("./routes/auth/register"));
app.use("/auth/login", require("./routes/auth/login"));
app.use("/auth/logout", require("./routes/auth/logout"));
app.use("/sellers", require("./routes/seller/seller"));
app.use("/products", require("./routes/product/products"));
app.use("/categories", require("./routes/product/categories"));
app.use("/subcategories", require("./routes/product/subcategories"));
app.use("/brands", require("./routes/product/brands"));
app.use("/product", require("./routes/product/singleproduct"));
app.use("/orders", require("./routes/orders/orders"));
app.use("/sellerOrders", require("./routes/orders/sellerOrders"));
app.use("/singleorder", require("./routes/orders/singleOrder"));
app.use("/delivery", require("./routes/delivery/delivery"));

// NEW: All products route for frontend product listing
app.use("/productlist", require("./routes/product/productlist"));

// Import auth middleware
const auth = require("./middleware/auth");

// Protected dashboard route
app.get("/dashboard", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, phone_number FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Fetch all users (protected)
app.get("/users", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).send("Server error");
  }
});

// Test route
app.get("/", (req, res) => res.send("Server is running 🚀"));

// Catch-all error handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
