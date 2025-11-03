const express = require("express");
const router = express.Router();

// POST /auth/logout
router.post("/", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // expire the cookie immediately
  });

  res.json({ msg: "Logged out successfully" });
});

module.exports = router;
