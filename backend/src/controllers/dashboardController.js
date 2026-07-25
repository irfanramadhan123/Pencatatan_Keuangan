const pool = require("../config/db");

const getDashboardSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE type = 'pemasukan'), 0) AS total_pemasukan,
        COALESCE(SUM(amount) FILTER (WHERE type = 'pengeluaran'), 0) AS total_pengeluaran
      FROM transactions
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    const totalPemasukan = Number(result.rows[0].total_pemasukan);
    const totalPengeluaran = Number(result.rows[0].total_pengeluaran);
    const saldo = totalPemasukan - totalPengeluaran;

    res.json({
      totalPemasukan,
      totalPengeluaran,
      saldo,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil dashboard",
    });
  }
};

module.exports = {
  getDashboardSummary,
};
