const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getSavings, createSaving, updateSaving, deleteSaving, addSavingHistory, getSavingHistory } = require("../controllers/savingController");

router.get("/", authMiddleware, getSavings);
router.post("/", authMiddleware, createSaving);
router.put("/:id", authMiddleware, updateSaving);
router.delete("/:id", authMiddleware, deleteSaving);
router.post("/:id/history", authMiddleware, addSavingHistory);
router.get("/:id/history", authMiddleware, getSavingHistory);

module.exports = router;
