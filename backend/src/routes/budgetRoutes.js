const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getBudgets, createBudget, updateBudget, deleteBudget } = require("../controllers/budgetController");

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, createBudget);
router.put("/:id", authMiddleware, updateBudget);
router.delete("/:id", authMiddleware, deleteBudget);

module.exports = router;
