const express = require("express");
const router = express.Router();
const { Favorite } = require("../../models"); // adjust path if needed
const auth = require("../../middleware/auth");

/**
 * GET /buyer/favorites/count
 * Get wishlist count for logged-in buyer
 */
router.get("/count", auth, async (req, res) => {
  try {
    // role protection
    if (req.user.role !== "buyer") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const userId = req.user.id;

    const count = await Favorite.count({
      where: { user_id: userId },
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Favorites count error:", error);
    res.status(500).json({
      msg: "Failed to fetch favorites count",
    });
  }
});

module.exports = router;
