const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Multer storage with per-user folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, `../../uploads/delivery/${req.user.id}`);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Helper to build full URLs for images
function attachImageUrls(profile, req) {
  const baseUrl = `${req.protocol}://${req.get("host")}/`;
  return {
    ...profile,
    profile_image: profile.profile_image ? baseUrl + profile.profile_image : null,
    id_card_image: profile.id_card_image ? baseUrl + profile.id_card_image : null,
  };
}

// GET /delivery/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM delivery_profiles WHERE user_id=$1", [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Delivery profile not found" });

    const profile = attachImageUrls(result.rows[0], req);
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// POST /delivery/activate
router.post(
  "/activate",
  auth,
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "id_card_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { vehicle_type, plate_number, license_number, national_id } = req.body;

      if (!/^\d{16}$/.test(national_id))
        return res.status(400).json({ message: "National ID must be 16 digits" });

      const existing = await pool.query("SELECT * FROM delivery_profiles WHERE user_id=$1", [req.user.id]);
      if (existing.rows.length) return res.status(400).json({ message: "Profile already exists" });

      const profile_image = req.files.profile_image
        ? `uploads/delivery/${req.user.id}/${req.files.profile_image[0].filename}`
        : null;
      const id_card_image = req.files.id_card_image
        ? `uploads/delivery/${req.user.id}/${req.files.id_card_image[0].filename}`
        : null;

      const insert = await pool.query(
        `INSERT INTO delivery_profiles 
         (user_id, vehicle_type, plate_number, license_number, national_id, profile_image, id_card_image, availability_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'offline') RETURNING *`,
        [req.user.id, vehicle_type, plate_number, license_number, national_id, profile_image, id_card_image]
      );

      const profile = attachImageUrls(insert.rows[0], req);
      res.json({ message: "Delivery profile created", profile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error creating profile" });
    }
  }
);

// PATCH /delivery/update
router.patch(
  "/update",
  auth,
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "id_card_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { vehicle_type, plate_number, license_number, national_id, availability_status } = req.body;

      const profile_image = req.files.profile_image
        ? `uploads/delivery/${req.user.id}/${req.files.profile_image[0].filename}`
        : undefined;
      const id_card_image = req.files.id_card_image
        ? `uploads/delivery/${req.user.id}/${req.files.id_card_image[0].filename}`
        : undefined;

      const update = await pool.query(
        `UPDATE delivery_profiles
         SET vehicle_type=$1,
             plate_number=$2,
             license_number=$3,
             profile_image=COALESCE($4, profile_image),
             id_card_image=COALESCE($5, id_card_image),
             national_id=COALESCE($6, national_id),
             availability_status=COALESCE($7, availability_status)
         WHERE user_id=$8 RETURNING *`,
        [vehicle_type, plate_number, license_number, profile_image, id_card_image, national_id, availability_status, req.user.id]
      );

      const profile = attachImageUrls(update.rows[0], req);
      res.json({ message: "Delivery profile updated", profile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error updating profile" });
    }
  }
);

// PATCH /delivery/toggle-availability
router.patch("/toggle-availability", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM delivery_profiles WHERE user_id=$1", [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Delivery profile not found" });

    const profile = result.rows[0];
    const newStatus = profile.availability_status === "online" ? "offline" : "online";

    const update = await pool.query(
      "UPDATE delivery_profiles SET availability_status=$1 WHERE user_id=$2 RETURNING *",
      [newStatus, req.user.id]
    );

    const updatedProfile = attachImageUrls(update.rows[0], req);
    res.json({ message: `You are now ${newStatus}`, profile: updatedProfile });
  } catch (err) {
    console.error("Toggle availability error:", err);
    res.status(500).json({ message: "Server error updating availability" });
  }
});

module.exports = router;
