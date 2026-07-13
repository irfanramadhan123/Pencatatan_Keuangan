const pool = require("../config/db");

// GET semua kategori milik user
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE user_id = $1
      ORDER BY id
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil kategori",
    });
  }
};

// POST kategori baru
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    const result = await pool.query(
      `
      INSERT INTO categories (user_id, name, type)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [req.user.id, name, type || 'pengeluaran']
    );

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      category: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal membuat kategori",
    });
  }
};

// PUT update kategori
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const result = await pool.query(
      `
      UPDATE categories
      SET name = $1, type = $2
      WHERE id = $3
      AND user_id = $4
      RETURNING *
      `,
      [name, type || 'pengeluaran', id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    res.json({
      message: "Kategori berhasil diupdate",
      category: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal update kategori",
    });
  }
};

// DELETE kategori
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM categories
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    res.json({
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menghapus kategori",
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
