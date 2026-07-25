const pool = require("../config/db");

const getSavings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM savings WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil tabungan" });
  }
};

const createSaving = async (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline } = req.body;
    const result = await pool.query(
      `INSERT INTO savings (user_id, name, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name, target_amount || 0, current_amount || 0, deadline || null]
    );
    res.status(201).json({ message: "Tabungan berhasil dibuat", saving: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat tabungan" });
  }
};

const updateSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target_amount, current_amount, deadline } = req.body;
    const result = await pool.query(
      `UPDATE savings SET name = $1, target_amount = $2, current_amount = $3, deadline = $4 WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name, target_amount, current_amount, deadline || null, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Tabungan tidak ditemukan" });
    res.json({ message: "Tabungan berhasil diupdate", saving: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal update tabungan" });
  }
};

const deleteSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM savings WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Tabungan tidak ditemukan" });
    res.json({ message: "Tabungan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus tabungan" });
  }
};

const addSavingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;
    const savingResult = await pool.query(
      `SELECT * FROM savings WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    if (savingResult.rows.length === 0) return res.status(404).json({ message: "Tabungan tidak ditemukan" });
    const saving = savingResult.rows[0];
    const newAmount = Number(saving.current_amount) + Number(amount);
    await pool.query(
      `UPDATE savings SET current_amount = $1 WHERE id = $2`,
      [newAmount, id]
    );
    const histResult = await pool.query(
      `INSERT INTO savings_history (saving_id, amount, note) VALUES ($1, $2, $3) RETURNING *`,
      [id, amount, note || null]
    );
    res.status(201).json({ message: "Riwayat tabungan ditambahkan", history: histResult.rows[0], new_current_amount: newAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambah riwayat tabungan" });
  }
};

const getSavingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const savingCheck = await pool.query(
      `SELECT * FROM savings WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    if (savingCheck.rows.length === 0) return res.status(404).json({ message: "Tabungan tidak ditemukan" });
    const result = await pool.query(
      `SELECT * FROM savings_history WHERE saving_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil riwayat tabungan" });
  }
};

module.exports = { getSavings, createSaving, updateSaving, deleteSaving, addSavingHistory, getSavingHistory };
