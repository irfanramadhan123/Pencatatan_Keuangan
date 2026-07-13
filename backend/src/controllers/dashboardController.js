const pool = require("../config/db");

const getDashboardSummary = async (req, res) => {
  try {

    console.log("REQ USER:", req.user);

    const pemasukan = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = $1
      AND type = 'pemasukan'
      `,
      [req.user.id]
    );

    const pengeluaran = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = $1
      AND type = 'pengeluaran'
      `,
      [req.user.id]
    );

    const totalPemasukan = Number(
      pemasukan.rows[0].total
    );

    const totalPengeluaran = Number(
      pengeluaran.rows[0].total
    );

    const saldo =
      totalPemasukan - totalPengeluaran;

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