const pool = require("../config/db");

const getBudgets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name AS category_name, c.type AS category_type FROM budgets b JOIN categories c ON b.category_id = c.id WHERE b.user_id = $1 ORDER BY b.period DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil anggaran" });
  }
};

const createBudget = async (req, res) => {
  try {
    const { category_id, amount, period } = req.body;
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category_id, amount, period) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, category_id, period) DO UPDATE SET amount = $3 RETURNING *`,
      [req.user.id, category_id, amount, period]
    );
    res.status(201).json({ message: "Anggaran berhasil dibuat", budget: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat anggaran" });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, amount, period } = req.body;
    const result = await pool.query(
      `UPDATE budgets SET category_id = $1, amount = $2, period = $3 WHERE id = $4 AND user_id = $5 RETURNING *`,
      [category_id, amount, period, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Anggaran tidak ditemukan" });
    res.json({ message: "Anggaran berhasil diupdate", budget: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal update anggaran" });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Anggaran tidak ditemukan" });
    res.json({ message: "Anggaran berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus anggaran" });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
