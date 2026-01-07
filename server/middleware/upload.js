const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sellerId = req.body.seller_id;
    if (!sellerId) return cb(new Error("Seller ID is required"), false);

    // create folder: uploads/products/{seller_id}
    const dir = path.join(__dirname, "..", "uploads", "products", sellerId.toString());
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

// Accept multiple images (up to 3)
const upload = multer({ storage });

module.exports = upload;
