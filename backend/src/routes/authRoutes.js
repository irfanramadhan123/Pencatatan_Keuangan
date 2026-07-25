const express = require("express");
const router = express.Router();

const {
  getMe,
  updateMe,
  googleAuth,
  googleCallback,
  deleteAccount,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.delete("/me", authMiddleware, deleteAccount);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

module.exports = router;
