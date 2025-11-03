const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sellerId = req.body.seller_id;
    if (!sellerId) return cb(new Error("Seller ID is required"), false);

    const dir = path.join(__dirname, "..", "uploads", "products", sellerId.toString());
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

module.exports = upload;
