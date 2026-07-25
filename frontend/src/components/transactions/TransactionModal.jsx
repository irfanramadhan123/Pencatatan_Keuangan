import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function parseIndonesianAmount(value) {
  const cleaned = String(value).trim().replace(/\s|Rp/gi, "");
  if (!cleaned) return NaN;

  // Titik adalah pemisah ribuan; koma tetap dapat dipakai sebagai pecahan.
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/\./g, "");

  return Number(normalized);
}

export default function TransactionModal({ show, onClose, onSuccess, editData, categories: propCategories, fundSources: propFundSources }) {
  const navigate = useNavigate();
  const [txForm, setTxForm] = useState({
    type: "pemasukan",
    description: "",
    amount: "",
    category_id: "",
    fund_source_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txError, setTxError] = useState("");
  const [categories, setCategories] = useState([]);
  const [fundSources, setFundSources] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      if (show) {
      // Ambil ulang data agar kategori yang baru dibuat langsung tersedia di modal edit.
      api.get("/categories").then((res) => setCategories(res.data || propCategories || [])).catch(() => setCategories(propCategories || []));
      api.get("/fund-sources").then((res) => setFundSources(res.data || propFundSources || [])).catch(() => setFundSources(propFundSources || []));
      if (editData) {
        setTxForm({
          type: editData.type || "pemasukan",
          description: editData.description || "",
          amount: String(editData.amount || ""),
          category_id: String(editData.category_id || ""),
          fund_source_id: String(editData.fund_source_id || ""),
          transaction_date: editData.transaction_date || new Date().toISOString().split("T")[0],
        });
      } else {
        setTxForm({
          type: "pemasukan",
          description: "",
          amount: "",
          category_id: "",
          fund_source_id: "",
          transaction_date: new Date().toISOString().split("T")[0],
        });
      }
      }
    }, 0);
  }, [show, editData, propCategories, propFundSources]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseIndonesianAmount(txForm.amount);
    if (!txForm.description || !txForm.amount || !txForm.category_id) {
      setTxError("Deskripsi, kategori, dan jumlah wajib diisi.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setTxError("Masukkan nominal yang valid, misalnya 10.000.");
      return;
    }
    setTxSubmitting(true);
    setTxError("");
    try {
      const payload = {
        ...txForm,
        amount,
        category_id: Number(txForm.category_id),
        fund_source_id: txForm.fund_source_id || null,
      };
      if (editData) {
        await api.put(`/transactions/${editData.id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setTxError(err.response?.data?.message || "Gagal menyimpan transaksi.");
    } finally {
      setTxSubmitting(false);
    }
  };

  if (!show) return null;

  // Kategori yang tersimpan pada transaksi lama tetap ditampilkan saat edit,
  // meskipun tipe kategorinya pernah diubah setelah transaksi dibuat.
  const availableCategories = categories.filter(
    (category) => category.type === txForm.type || String(category.id) === String(txForm.category_id)
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Tutup">
            <span />
          </button>
        </div>
        {txError && <div className="modal-error">{txError}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-type-tabs">
            <button type="button" className={txForm.type === "pemasukan" ? "selected income" : ""} onClick={() => setTxForm({ ...txForm, type: "pemasukan", category_id: "" })}>Pemasukan</button>
            <button type="button" className={txForm.type === "pengeluaran" ? "selected expense" : ""} onClick={() => setTxForm({ ...txForm, type: "pengeluaran", category_id: "" })}>Pengeluaran</button>
          </div>
          <label>
            Deskripsi
            <input type="text" placeholder="Contoh: Gaji bulanan" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} required />
          </label>
          <label>
            Jumlah (Rp)
            <input type="text" inputMode="decimal" placeholder="Contoh: 10.000" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} required />
          </label>
          <div className="modal-row">
            <label>
              Kategori
              <select value={txForm.category_id} onChange={(e) => setTxForm({ ...txForm, category_id: e.target.value })} required>
                <option value="">{availableCategories.length ? "Pilih kategori" : "Belum ada kategori"}</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Sumber Dana
              <select value={txForm.fund_source_id} onChange={(e) => setTxForm({ ...txForm, fund_source_id: e.target.value })}>
                <option value="">Pilih sumber dana</option>
                {fundSources.map((fs) => (
                  <option key={fs.id} value={fs.id}>{fs.name}</option>
                ))}
              </select>
            </label>
          </div>
          {availableCategories.length === 0 && (
            <button type="button" className="modal-submit" onClick={() => { onClose(); navigate("/kategori"); }}>
              Buat Kategori Dulu
            </button>
          )}
          <label>
            Tanggal
            <input type="date" value={txForm.transaction_date} onChange={(e) => setTxForm({ ...txForm, transaction_date: e.target.value })} />
          </label>
          <button type="submit" className="modal-submit" disabled={txSubmitting}>
            {txSubmitting ? "Menyimpan..." : editData ? "Update Transaksi" : "Simpan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
