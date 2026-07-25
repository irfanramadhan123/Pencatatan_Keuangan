import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";
import { ChartNoAxesCombined, Trash2 } from "lucide-react";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category_id: "", amount: "", period: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [budRes, catRes, txRes] = await Promise.all([
        api.get("/budgets"),
        api.get("/categories"),
        api.get("/transactions?limit=99999"),
      ]);
      setBudgets(budRes.data || []);
      setCategories(catRes.data || []);
      const txData = txRes.data;
      setTransactions(Array.isArray(txData) ? txData : (txData.data || []));
    } catch {
      setLoadError("Gagal memuat anggaran.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setTimeout(() => fetchData(), 0); }, []);

  const currentPeriod = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const budgetCards = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === "pengeluaran" &&
            Number(t.category_id) === Number(b.category_id) &&
            t.transaction_date &&
            t.transaction_date.startsWith(b.period)
        )
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      const amount = Number(b.amount || 0);
      const usage = amount > 0 ? Math.min(Math.round((spent / amount) * 100), 100) : 0;
      return { ...b, spent, usage };
    });
  }, [budgets, transactions]);

  const totalBudget = budgetCards.reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalSpent = budgetCards.reduce((s, b) => s + b.spent, 0);
  const remaining = Math.max(totalBudget - totalSpent, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.amount || !form.period) return;
    setIsSaving(true);
    try {
      await api.post("/budgets", {
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        period: form.period,
      });
      setForm({ category_id: "", amount: "", period: "" });
      setShowForm(false);
      fetchData();
    } catch {
      setLoadError("Gagal membuat anggaran.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus anggaran ini?")) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchData();
    } catch {
      setLoadError("Gagal menghapus anggaran.");
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "pengeluaran");

  if (isLoading) {
    return (
      <div className="empty-state tall" style={{ marginTop: 72 }}>
        <strong>Memuat anggaran...</strong>
      </div>
    );
  }

  return (
    <>
      <section className="category-hero">
        <div>
          <h1>Anggaran</h1>
          <p>Atur batas pengeluaran per kategori setiap bulan.</p>
        </div>
        <button
          className="primary-action"
          onClick={() => {
            setForm({ category_id: "", amount: "", period: currentPeriod });
            setShowForm((v) => !v);
          }}
          type="button"
        >
          + Tambah Anggaran
        </button>
      </section>

      {loadError && <p className="notice">{loadError}</p>}

      {showForm && (
        <form className="category-form" onSubmit={handleSubmit}>
          <label>
            Kategori
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Pilih kategori</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Jumlah anggaran (Rp)
            <input
              type="number"
              placeholder="0"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label>
            Periode (bulan)
            <input
              type="month"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
            />
          </label>
          <button disabled={isSaving} type="submit">
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      )}

      <section className="category-summary" aria-label="Ringkasan anggaran">
        <article>
          <span>Total Anggaran</span>
          <strong>{budgetCards.length}</strong>
        </article>
        <article>
          <span>Budget</span>
          <strong>{formatCurrency(totalBudget)}</strong>
        </article>
        <article>
          <span>Terpakai</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </article>
        <article>
          <span>Sisa</span>
          <strong>{formatCurrency(remaining)}</strong>
        </article>
        <article>
          <span>Efisiensi</span>
          <strong>{totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0}%</strong>
        </article>
      </section>

      <section className="category-grid" aria-label="Daftar anggaran">
        {budgetCards.map((b) => (
          <article className="category-card" key={b.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="category-icon orange">
                <ChartNoAxesCombined size={20} strokeWidth={2} />
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "18px", padding: "4px 8px", cursor: "pointer" }}
                title="Hapus anggaran"
                type="button"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
            <h2>{b.category_name || "Kategori"}</h2>
            <p>Periode: {b.period}</p>
            <div className="category-row">
              <span>Terpakai</span>
              <strong className={b.spent > Number(b.amount) ? "negative" : ""}>{formatCurrency(b.spent)}</strong>
            </div>
            <div className="category-progress">
              <span
                className={b.usage > 100 ? "pink" : b.usage > 75 ? "orange" : "green"}
                style={{ width: `${Math.min(b.usage, 100)}%` }}
              />
            </div>
            <div className="category-row">
              <span>Anggaran</span>
              <strong>{formatCurrency(b.amount)}</strong>
            </div>
            <div className="progress-detail">
              {b.usage}% terpakai
              {b.usage > 100 && " — Melebihi anggaran!"}
            </div>
          </article>
        ))}

        <button className="create-category-card" onClick={() => setShowForm(true)} type="button">
          <span>+</span>
          <strong>Buat Anggaran Baru</strong>
        </button>
      </section>

      {budgetCards.length === 0 && !showForm && (
        <div className="empty-state tall category-empty">
          <strong>Belum ada anggaran</strong>
          <span>Atur batas pengeluaran per kategori untuk mengontrol keuanganmu.</span>
        </div>
      )}
    </>
  );
}

export default Budgets;
