import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const colorClasses = ["blue", "pink", "green", "orange", "violet", "slate"];

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("pengeluaran");
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getCategoryData = async () => {
    const [categoriesResponse, transactionsResponse] = await Promise.all([
      api.get("/categories"),
      api.get("/transactions"),
    ]);
    return {
      categories: categoriesResponse.data,
      transactions: transactionsResponse.data,
    };
  };

  useEffect(() => {
    let shouldUpdate = true;
    getCategoryData()
      .then((data) => {
        if (!shouldUpdate) return;
        setCategories(data.categories);
        setTransactions(data.transactions);
        setLoadError("");
      })
      .catch(() => {
        if (!shouldUpdate) return;
        setCategories([]);
        setTransactions([]);
        setLoadError("Data kategori belum bisa dimuat. Pastikan backend berjalan dan akun sudah login.");
      });
    return () => { shouldUpdate = false; };
  }, []);

  const categoryCards = useMemo(() => {
    return categories
      .map((category, index) => {
        const spent = transactions
          .filter((t) => t.type === "pengeluaran" && Number(t.category_id) === Number(category.id))
          .reduce((total, t) => total + Number(t.amount || 0), 0);
        const budget = Number(category.budget || 0);
        const usage = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
        return { ...category, budget, spent, usage, tone: colorClasses[index % colorClasses.length] };
      })
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search, transactions]);

  const totalSpent = categoryCards.reduce((total, c) => total + c.spent, 0);
  const totalBudget = categoryCards.reduce((total, c) => total + c.budget, 0);
  const remaining = Math.max(totalBudget - totalSpent, 0);
  const efficiency = totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setIsSaving(true);
    try {
      await api.post("/categories", { name: newCategory.trim(), type: newType });
      const data = await getCategoryData();
      setCategories(data.categories);
      setTransactions(data.transactions);
      setNewCategory("");
      setShowForm(false);
    } catch {
      setLoadError("Kategori gagal dibuat. Cek koneksi backend atau struktur tabel database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`/categories/${id}`);
      const data = await getCategoryData();
      setCategories(data.categories);
      setTransactions(data.transactions);
    } catch {
      setLoadError("Gagal menghapus kategori.");
    }
  };

  return (
    <>
      <section className="category-hero">
        <div>
          <h1>Kategori</h1>
          <p>Kelola kelompok transaksi dan pantau pemakaian dana per kategori.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label className="search-box" style={{ width: '220px' }}>
            <span />
            <input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kategori..."
              value={search}
            />
          </label>
          <button className="primary-action" onClick={() => setShowForm((v) => !v)} type="button">
            + Tambah Kategori
          </button>
        </div>
      </section>

      {loadError && <p className="notice">{loadError}</p>}

      {showForm && (
        <form className="category-form" onSubmit={handleSubmit}>
          <label>
            Nama kategori
            <input
              autoFocus
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Contoh: Makanan, Transportasi, Tagihan"
              value={newCategory}
            />
          </label>
          <label>
            Tipe
            <select value={newType} onChange={(e) => setNewType(e.target.value)}>
              <option value="pengeluaran">Pengeluaran</option>
              <option value="pemasukan">Pemasukan</option>
            </select>
          </label>
          <button disabled={isSaving} type="submit">
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      )}

      <section className="category-summary" aria-label="Ringkasan kategori">
        <article><span>Total Kategori</span><strong>{categoryCards.length}</strong></article>
        <article><span>Total Budget</span><strong>{formatCurrency(totalBudget)}</strong></article>
        <article><span>Total Terpakai</span><strong>{formatCurrency(totalSpent)}</strong></article>
        <article><span>Sisa Budget</span><strong>{formatCurrency(remaining)}</strong></article>
        <article><span>Efisiensi</span><strong>{efficiency}%</strong></article>
      </section>

      <section className="category-grid" aria-label="Daftar kategori">
        {categoryCards.map((category) => (
          <article className="category-card" key={category.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className={`category-icon ${category.tone}`}>
                <span />
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '18px', padding: '4px 8px', cursor: 'pointer' }}
                title="Hapus kategori"
                type="button"
              >
                ✕
              </button>
            </div>
            <h2>{category.name}</h2>
            <p>
              <mark className={category.type === 'pemasukan' ? 'income' : 'expense'}>
                {category.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
              </mark>
            </p>
            <div className="category-row">
              <span>Budget</span>
              <strong>{category.budget > 0 ? formatCurrency(category.budget) : "Belum diatur"}</strong>
            </div>
            <div className="category-progress">
              <span className={category.tone} style={{ width: `${category.usage}%` }} />
            </div>
            <div className="category-row">
              <span>Terpakai</span>
              <strong className={category.spent > 0 ? "negative" : ""}>{formatCurrency(category.spent)}</strong>
            </div>
          </article>
        ))}

        <button className="create-category-card" onClick={() => setShowForm(true)} type="button">
          <span>+</span>
          <strong>Buat Kategori Baru</strong>
        </button>
      </section>

      {categoryCards.length === 0 && (
        <div className="empty-state tall category-empty">
          <strong>Belum ada kategori</strong>
          <span>Tambahkan kategori pertama untuk memisahkan pemasukan dan pengeluaran akun ini.</span>
        </div>
      )}
    </>
  );
}

export default Categories;
