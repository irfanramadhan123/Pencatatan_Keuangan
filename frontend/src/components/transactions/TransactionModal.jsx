import { useState, useEffect } from "react";
import api from "../../services/api";

export default function TransactionModal({ show, onClose, onSuccess }) {
  const [txForm, setTxForm] = useState({
    type: "pemasukan",
    description: "",
    amount: "",
    category_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txError, setTxError] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (show) {
      api.get("/categories").then((res) => setCategories(res.data || [])).catch(() => {});
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.description || !txForm.amount) {
      setTxError("Deskripsi dan jumlah wajib diisi.");
      return;
    }
    setTxSubmitting(true);
    setTxError("");
    try {
      await api.post("/transactions", {
        ...txForm,
        amount: Number(txForm.amount),
        category_id: txForm.category_id || null,
      });
      setTxForm({ type: "pemasukan", description: "", amount: "", category_id: "", transaction_date: new Date().toISOString().split("T")[0] });
      onSuccess();
      onClose();
    } catch (err) {
      setTxError(err.response?.data?.message || "Gagal menyimpan transaksi.");
    } finally {
      setTxSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tambah Transaksi</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Tutup">
            <span />
          </button>
        </div>
        {txError && <div className="modal-error">{txError}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-type-tabs">
            <button type="button" className={txForm.type === "pemasukan" ? "selected income" : ""} onClick={() => setTxForm({ ...txForm, type: "pemasukan" })}>Pemasukan</button>
            <button type="button" className={txForm.type === "pengeluaran" ? "selected expense" : ""} onClick={() => setTxForm({ ...txForm, type: "pengeluaran" })}>Pengeluaran</button>
          </div>
          <label>
            Deskripsi
            <input type="text" placeholder="Contoh: Gaji bulanan" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} required />
          </label>
          <label>
            Jumlah (Rp)
            <input type="number" placeholder="0" min="1" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} required />
          </label>
          <div className="modal-row">
            <label>
              Kategori
              <select value={txForm.category_id} onChange={(e) => setTxForm({ ...txForm, category_id: e.target.value })}>
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Tanggal
              <input type="date" value={txForm.transaction_date} onChange={(e) => setTxForm({ ...txForm, transaction_date: e.target.value })} />
            </label>
          </div>
          <button type="submit" className="modal-submit" disabled={txSubmitting}>
            {txSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
