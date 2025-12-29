const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const auth = require("../../middleware/auth");

// GET /admin/dashboard
router.get("/", auth, async (req, res) => {
  const { role, id } = req.user;

  try {
    let data = {
      totalSellers: 0,
      pendingApprovals: 0,
      totalBuyers: 0,
      activeTransactions: 0,
      cityClerks: 0,
      recentActivities: 0,
      pendingVerifications: 0,
      activeListings: 0,
    };

    // COMMON QUERIES
    const [
      totalSellersRes,
      pendingApprovalsRes,
      totalBuyersRes,
      activeTransactionsRes,
      activeListingsRes,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM sellers"),
      pool.query("SELECT COUNT(*) FROM sellers WHERE is_verified = false"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'buyer'"),
      pool.query("SELECT COUNT(*) FROM orders WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM products"),
    ]);

    data.totalSellers = Number(totalSellersRes.rows[0].count);
    data.pendingApprovals = Number(pendingApprovalsRes.rows[0].count);
    data.pendingVerifications = Number(pendingApprovalsRes.rows[0].count);
    data.totalBuyers = Number(totalBuyersRes.rows[0].count);
    data.activeTransactions = Number(activeTransactionsRes.rows[0].count);
    data.activeListings = Number(activeListingsRes.rows[0].count);

    if (role === "admin") {
      const cityClerksRes = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'city-clerk'"
      );
      data.cityClerks = Number(cityClerksRes.rows[0].count);
      data.recentActivities = 0;
    } else if (role === "city-clerk") {
      data.cityClerks = 0;
      data.recentActivities = 0;
    } else {
      return res.status(403).json({ msg: "Unauthorized role" });
    }

    res.json({ user: { id, role }, dashboard: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
