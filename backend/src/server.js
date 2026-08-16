const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const fundSourceRoutes = require("./routes/fundSourceRoutes");
const savingRoutes = require("./routes/savingRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/fund-sources", fundSourceRoutes);
app.use("/api/savings", savingRoutes);
app.use("/api/budgets", budgetRoutes);
app.get("/", (req, res) => {
  res.send("API berjalan");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database gagal terhubung",
    });
  }
});

app.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Akses berhasil",
    user: req.user,
  });
});


app.listen(5000, "0.0.0.0", () => {
  console.log("Server berjalan di port 5000");
});
