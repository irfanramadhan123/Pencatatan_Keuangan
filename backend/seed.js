const pool = require("./src/config/db");
const bcrypt = require("bcrypt");

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Cek user demo
    const existing = await client.query("SELECT id FROM users WHERE email = 'demo@uangku.com'");
    if (existing.rows.length > 0) {
      console.log("User demo sudah ada. Menghapus data lama untuk seed ulang...");
      await client.query("DELETE FROM transactions WHERE user_id = $1", [existing.rows[0].id]);
      await client.query("DELETE FROM categories WHERE user_id = $1", [existing.rows[0].id]);
      await client.query("DELETE FROM fund_sources WHERE user_id = $1", [existing.rows[0].id]);
    }

    // Hapus user demo lama kalau ada
    await client.query("DELETE FROM users WHERE email = 'demo@uangku.com'");

    // 1. User demo
    const hashed = await bcrypt.hash("demo123", 10);
    const user = await client.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      ["Demo User", "demo@uangku.com", hashed]
    );
    const userId = user.rows[0].id;
    console.log(`User demo dibuat: id=${userId}`);

    // 2. Kategori pemasukan
    const incomeCats = ["Gaji", "Freelance", "Investasi", "Bonus", "Lain-lain"];
    const incomeCatIds = [];
    for (const name of incomeCats) {
      const res = await client.query(
        "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'pemasukan') RETURNING id",
        [userId, name]
      );
      incomeCatIds.push(res.rows[0].id);
    }
    console.log("Kategori pemasukan dibuat");

    // 3. Kategori pengeluaran
    const expenseCats = ["Makanan", "Transportasi", "Belanja", "Hiburan", "Tagihan", "Kesehatan", "Pendidikan", "Lainnya"];
    const expenseCatIds = [];
    for (const name of expenseCats) {
      const res = await client.query(
        "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'pengeluaran') RETURNING id",
        [userId, name]
      );
      expenseCatIds.push(res.rows[0].id);
    }
    console.log("Kategori pengeluaran dibuat");

    // 4. Sumber dana
    const funds = ["Tunai", "BCA", "Mandiri", "GoPay", "OVO"];
    const fundIds = [];
    for (const name of funds) {
      const res = await client.query(
        "INSERT INTO fund_sources (user_id, name) VALUES ($1, $2) RETURNING id",
        [userId, name]
      );
      fundIds.push(res.rows[0].id);
    }
    console.log("Sumber dana dibuat");

    // 5. Transaksi dummy (3 bulan terakhir)
    const now = new Date();
    const types = ["pemasukan", "pengeluaran"];
    const descriptions = {
      pemasukan: ["Gaji bulanan", "Project freelance", "Dividen saham", "Bonus akhir tahun", "Hasil jual barang"],
      pengeluaran: ["Makan siang", "Bensin", "Belanja bulanan", "Netflix", "Listrik", "Beli obat", "Kursus online", "Nonton bioskop"],
    };

    const transactions = [];
    for (let i = 0; i < 60; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));

      if (type === "pemasukan") {
        const catId = incomeCatIds[Math.floor(Math.random() * incomeCatIds.length)];
        const amounts = [4500000, 5000000, 5500000, 2000000, 3000000, 1500000, 750000, 1000000];
        transactions.push({
          user_id: userId,
          category_id: catId,
          fund_source_id: fundIds[Math.floor(Math.random() * fundIds.length)],
          type,
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          description: descriptions.pemasukan[Math.floor(Math.random() * descriptions.pemasukan.length)],
          transaction_date: date.toISOString().split("T")[0],
        });
      } else {
        const catId = expenseCatIds[Math.floor(Math.random() * expenseCatIds.length)];
        const amounts = [25000, 50000, 75000, 100000, 150000, 200000, 350000, 50000, 15000, 30000];
        transactions.push({
          user_id: userId,
          category_id: catId,
          fund_source_id: fundIds[Math.floor(Math.random() * fundIds.length)],
          type,
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          description: descriptions.pengeluaran[Math.floor(Math.random() * descriptions.pengeluaran.length)],
          transaction_date: date.toISOString().split("T")[0],
        });
      }
    }

    for (const t of transactions) {
      await client.query(
        "INSERT INTO transactions (user_id, category_id, fund_source_id, type, amount, description, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [t.user_id, t.category_id, t.fund_source_id, t.type, t.amount, t.description, t.transaction_date]
      );
    }
    console.log(`${transactions.length} transaksi dummy dibuat`);

    await client.query("COMMIT");
    console.log("Seed selesai! Login: demo@uangku.com / demo123");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed gagal:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();