const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  getMe,
  updateMe,
  googleAuth,
  googleCallback,
  deleteAccount,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.delete("/me", authMiddleware, deleteAccount);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

module.exports = router;
