const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const upload = require("../../middleware/upload");
const path = require("path");
const fs = require("fs");

// GET all products for a seller
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId, 10);

    const result = await pool.query(
      "SELECT * FROM products WHERE seller_id=$1",
      [sellerId]
    );

    const products = result.rows.map((p) => {
      // normalize image paths
      ["image_url1", "image_url2", "image_url3"].forEach((key) => {
        if (p[key]) p[key] = p[key].replace(/\\/g, "/");
      });
      return p;
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching products." });
  }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const result = await pool.query(
      `SELECT 
        p.*,
        c.name as category_name,
        s.name as subcategory_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = $1`,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    const product = result.rows[0];
    // normalize image paths
    ["image_url1", "image_url2", "image_url3"].forEach((key) => {
      if (product[key]) product[key] = product[key].replace(/\\/g, "/");
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching product." });
  }
});

// CREATE product
router.post("/", upload.array("images", 3), async (req, res) => {
  try {
    const {
      seller_id,
      name,
      description,
      price,
      stock,
      category_id,
      subcategory_id,
      brand_id,
      usage,
      status,
    } = req.body;

    if (!seller_id || !name || !price) {
      return res
        .status(400)
        .json({ message: "Seller ID, name, and price are required." });
    }

    const sellerIdNum = parseInt(seller_id, 10);

    // handle multiple images
    const imagePaths = req.files
      ? req.files.map((file) =>
          path
            .join("uploads", "products", sellerIdNum.toString(), file.filename)
            .replace(/\\/g, "/")
        )
      : [];

    const insertQuery = `
      INSERT INTO products
        (seller_id, name, description, price, stock, category_id, subcategory_id, brand_id,
         image_url1, image_url2, image_url3, usage, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;

    const values = [
      sellerIdNum,
      name,
      description || "",
      price,
      stock || 0,
      category_id || null,
      subcategory_id || null,
      brand_id || null,
      imagePaths[0] || null,
      imagePaths[1] || null,
      imagePaths[2] || null,
      usage || "",
      status || "active",
    ];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating product." });
  }
});

// UPDATE product
router.put("/:id", upload.array("images", 3), async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const {
      name,
      description,
      price,
      stock,
      category_id,
      subcategory_id,
      brand_id,
      usage,
      status,
    } = req.body;

    // First, get the current product to know the seller ID
    const currentProduct = await pool.query(
      "SELECT seller_id, image_url1, image_url2, image_url3 FROM products WHERE id = $1",
      [productId]
    );

    if (currentProduct.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    const sellerId = currentProduct.rows[0].seller_id;
    const oldImages = [
      currentProduct.rows[0].image_url1,
      currentProduct.rows[0].image_url2,
      currentProduct.rows[0].image_url3,
    ].filter((img) => img);

    let imagePaths = [...oldImages];

    // If new files are uploaded, replace old images
    if (req.files && req.files.length > 0) {
      // Delete old image files from server
      oldImages.forEach((oldImagePath) => {
        if (oldImagePath) {
          const fullPath = path.join(__dirname, "../../", oldImagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });

      // Save new images
      imagePaths = req.files.map((file) =>
        path
          .join("uploads", "products", sellerId.toString(), file.filename)
          .replace(/\\/g, "/")
      );
    }

    const updateQuery = `
      UPDATE products SET
        name = $1,
        description = $2,
        price = $3,
        stock = $4,
        category_id = $5,
        subcategory_id = $6,
        brand_id = $7,
        image_url1 = $8,
        image_url2 = $9,
        image_url3 = $10,
        usage = $11,
        status = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *;
    `;

    const values = [
      name,
      description || "",
      price,
      stock || 0,
      category_id || null,
      subcategory_id || null,
      brand_id || null,
      imagePaths[0] || null,
      imagePaths[1] || null,
      imagePaths[2] || null,
      usage || "",
      status || "active",
      productId,
    ];

    const { rows } = await pool.query(updateQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Normalize image paths in response
    const product = rows[0];
    ["image_url1", "image_url2", "image_url3"].forEach((key) => {
      if (product[key]) product[key] = product[key].replace(/\\/g, "/");
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating product." });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    // First, get product to delete image files
    const productResult = await pool.query(
      "SELECT image_url1, image_url2, image_url3 FROM products WHERE id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Delete image files from server
    const product = productResult.rows[0];
    [product.image_url1, product.image_url2, product.image_url3].forEach(
      (imagePath) => {
        if (imagePath) {
          const fullPath = path.join(__dirname, "../../", imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    );

    // Delete from database
    const deleteResult = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [productId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({
      message: "Product deleted successfully.",
      productId: deleteResult.rows[0].id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting product." });
  }
});

module.exports = router;
