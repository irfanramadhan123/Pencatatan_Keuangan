const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateMe,
  forgotPassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.put("/forgot-password", forgotPassword);

module.exports = router;
