const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getFundSources,
  createFundSource,
  deleteFundSource,
} = require("../controllers/fundSourceController");

router.get("/", authMiddleware, getFundSources);
router.post("/", authMiddleware, createFundSource);
router.delete("/:id", authMiddleware, deleteFundSource);

module.exports = router;
