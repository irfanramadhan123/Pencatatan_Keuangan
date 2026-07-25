import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";
import { ArrowUpRight, ArrowDownRight, Plus, Trash2, Pencil } from "lucide-react";
import TransactionModal from "../components/transactions/TransactionModal";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fundSources, setFundSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("semua");
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setLoadError("");
    try {
      const targetPage = append ? page + 1 : 1;
      const [txRes, catRes, fsRes] = await Promise.all([
        api.get(`/transactions?page=${targetPage}&limit=30`),
        api.get("/categories"),
        api.get("/fund-sources"),
      ]);
      const newTx = txRes.data.data || [];
      const total = txRes.data.total || 0;
      const currentPage = txRes.data.page || 1;
      const loaded = append ? transactions.length : 0;
      if (append) {
        setTransactions((prev) => [...prev, ...newTx]);
      } else {
        setTransactions(newTx);
      }
      setPage(currentPage);
      setHasMore(loaded + newTx.length < total);
      setCategories(catRes.data || []);
      setFundSources(fsRes.data || []);
    } catch {
      setLoadError("Gagal memuat data transaksi.");
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { setTimeout(() => fetchData(), 0); },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filterType !== "semua" && t.type !== filterType) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            (t.description || "").toLowerCase().includes(q) ||
            (t.category_name || "").toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [transactions, filterType, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchData();
    } catch {
      setLoadError("Gagal menghapus transaksi.");
    }
  };

  const handleEdit = (tx) => {
    setEditTx(tx);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditTx(null);
    fetchData();
  };

  const totalPemasukan = filtered
    .filter((t) => t.type === "pemasukan")
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalPengeluaran = filtered
    .filter((t) => t.type === "pengeluaran")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="empty-state tall" style={{ marginTop: 72 }}>
        <strong>Memuat transaksi...</strong>
      </div>
    );
  }

  return (
    <>
      <section className="category-hero">
        <div>
          <h1>Transaksi</h1>
          <p>Semua catatan pemasukan dan pengeluaran keuanganmu.</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label className="search-box" style={{ width: 220 }}>
            <span className="search-icon" />
            <input
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button
            className="primary-action"
            onClick={() => { setEditTx(null); setShowModal(true); }}
            type="button"
          >
            + Tambah Transaksi
          </button>
        </div>
      </section>

      {loadError && <p className="notice">{loadError}</p>}

      <section className="category-summary" aria-label="Ringkasan transaksi">
        <article>
          <span>Total Transaksi</span>
          <strong>{filtered.length}</strong>
        </article>
        <article>
          <span>Pemasukan</span>
          <strong style={{ color: "#22c55e" }}>{formatCurrency(totalPemasukan)}</strong>
        </article>
        <article>
          <span>Pengeluaran</span>
          <strong style={{ color: "#ef4444" }}>{formatCurrency(totalPengeluaran)}</strong>
        </article>
        <article>
          <span>Saldo Bersih</span>
          <strong>{formatCurrency(totalPemasukan - totalPengeluaran)}</strong>
        </article>
        <article>
          <span>Filter</span>
          <strong style={{ fontSize: 14 }}>
            {filterType === "semua" ? "Semua" : filterType === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
          </strong>
        </article>
      </section>

      <section className="report-tabs" aria-label="Filter tipe">
        {["semua", "pemasukan", "pengeluaran"].map((tab) => (
          <button
            key={tab}
            className={filterType === tab ? "selected" : ""}
            onClick={() => setFilterType(tab)}
            type="button"
          >
            {tab === "semua" ? "Semua" : tab === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
          </button>
        ))}
      </section>

      <section className="report-list" aria-label="Daftar transaksi">
        {filtered.length > 0 && (
          <div className="report-row report-head">
            <span>Transaksi</span>
            <span>Kategori</span>
            <span>Jumlah</span>
            <span>Aksi</span>
          </div>
        )}
        {filtered.length > 0 ? (
          filtered.map((tx) => (
            <article className="report-row" key={tx.id}>
              <div className="report-name">
                <i className={tx.type === "pemasukan" ? "income-bg" : "expense-bg"} style={{ borderRadius: 10, width: 42, height: 42 }}>
                  {tx.type === "pemasukan" ? (
                    <ArrowUpRight size={18} strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight size={18} strokeWidth={2.5} />
                  )}
                </i>
                <div>
                  <strong>{tx.description || "Tanpa deskripsi"}</strong>
                  <span>{tx.transaction_date}{tx.fund_source_name ? ` · ${tx.fund_source_name}` : ""}</span>
                </div>
              </div>
              <mark className={tx.type === "pemasukan" ? "income" : "expense"}>
                {tx.category_name || "Umum"}
              </mark>
              <strong className={tx.type === "pemasukan" ? "positive" : "negative"}>
                {tx.type === "pemasukan" ? "+" : "-"}{formatCurrency(tx.amount)}
              </strong>
              <div className="report-row-actions">
                <button
                  onClick={() => handleEdit(tx)}
                  style={{ background: "var(--blue-50)", border: 0, borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "var(--blue-600)" }}
                  type="button"
                  title="Edit"
                >
                  <Pencil size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={() => handleDelete(tx.id)}
                  style={{ background: "rgba(239,68,68,0.12)", border: 0, borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#ef4444" }}
                  type="button"
                  title="Hapus"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state tall">
            <strong>Belum ada transaksi</strong>
            <span>Mulai catat pemasukan atau pengeluaran untuk mengelola keuanganmu.</span>
          </div>
        )}

        {filtered.length > 0 && hasMore && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              className="primary-action"
              onClick={() => fetchData(true)}
              disabled={loadingMore}
              type="button"
            >
              {loadingMore ? "Memuat..." : "Muat lebih banyak"}
            </button>
          </div>
        )}
      </section>

      <button
        className="fab"
        onClick={() => { setEditTx(null); setShowModal(true); }}
        type="button"
        aria-label="Tambah Transaksi"
      >
        <span className="fab-icon"><Plus size={24} strokeWidth={3} /></span>
        <span className="fab-label">Tambah Transaksi</span>
      </button>

      <TransactionModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditTx(null); }}
        onSuccess={handleSuccess}
        editData={editTx}
        categories={categories}
        fundSources={fundSources}
      />
    </>
  );
}

export default Transactions;
