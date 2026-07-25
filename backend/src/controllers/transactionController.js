const pool = require("../config/db");

// GET transaksi user dengan pagination
const getTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
    const pageLimit = Math.min(Math.max(1, Number(limit)), 200);

    let where = "WHERE t.user_id = $1";
    const params = [req.user.id];

    if (type) {
      params.push(type);
      where += ` AND t.type = $${params.length}`;
    }

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transactions t ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch page
    params.push(pageLimit, offset);
    const query = `
      SELECT
        t.*,
        c.name AS category_name,
        fs.name AS fund_source_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN fund_sources fs ON t.fund_source_id = fs.id
      ${where}
      ORDER BY t.transaction_date DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);

    res.json({ data: result.rows, total, page: Math.max(1, Number(page)), limit: pageLimit });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil transaksi",
    });
  }
};

// POST transaksi baru
const createTransaction = async (req, res) => {
  try {
    const {
      category_id,
      type,
      amount,
      description,
      transaction_date,
      fund_source_id,
    } = req.body;

    if (!category_id || !["pemasukan", "pengeluaran"].includes(type) || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !transaction_date) {
      return res.status(400).json({ message: "Data transaksi belum lengkap atau nominal tidak valid" });
    }

    const category = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND user_id = $2 AND type = $3",
      [category_id, req.user.id, type]
    );
    if (category.rows.length === 0) {
      return res.status(400).json({ message: "Pilih kategori yang sesuai dengan jenis transaksi" });
    }

    const result = await pool.query(
      `
      INSERT INTO transactions
      (
        user_id,
        category_id,
        type,
        amount,
        description,
        transaction_date,
        fund_source_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        req.user.id,
        category_id,
        type,
        amount,
        description,
        transaction_date,
        fund_source_id || null,
      ]
    );

    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal membuat transaksi",
    });
  }
};

// PUT transaksi
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      type,
      amount,
      description,
      transaction_date,
      fund_source_id,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE transactions
      SET
        category_id = $1,
        type = $2,
        amount = $3,
        description = $4,
        transaction_date = $5,
        fund_source_id = $6
      WHERE id = $7
      AND user_id = $8
      RETURNING *
      `,
      [
        category_id,
        type,
        amount,
        description,
        transaction_date,
        fund_source_id || null,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    res.json({
      message: "Transaksi berhasil diupdate",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal update transaksi",
    });
  }
};

// DELETE transaksi
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM transactions
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    res.json({
      message: "Transaksi berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menghapus transaksi",
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
