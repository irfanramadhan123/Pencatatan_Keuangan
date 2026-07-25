const pool = require("../config/db");

// GET semua sumber dana milik user
const getFundSources = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM fund_sources
      WHERE user_id = $1
      ORDER BY id ASC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil sumber dana",
    });
  }
};

// POST sumber dana baru
const createFundSource = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      `
      INSERT INTO fund_sources (user_id, name)
      VALUES ($1, $2)
      RETURNING *
      `,
      [req.user.id, name]
    );

    res.status(201).json({
      message: "Sumber dana berhasil dibuat",
      fund_source: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal membuat sumber dana",
    });
  }
};

// DELETE sumber dana
const deleteFundSource = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM fund_sources
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Sumber dana tidak ditemukan",
      });
    }

    res.json({
      message: "Sumber dana berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menghapus sumber dana",
    });
  }
};

// UPDATE sumber dana
const updateFundSource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      `UPDATE fund_sources SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [name, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Sumber dana tidak ditemukan" });
    }
    res.json({ message: "Sumber dana berhasil diupdate", fund_source: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengupdate sumber dana" });
  }
};

module.exports = {
  getFundSources,
  createFundSource,
  updateFundSource,
  deleteFundSource,
};
