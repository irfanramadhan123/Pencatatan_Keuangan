import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";
import { PiggyBank, Trash2, TrendingUp } from "lucide-react";

function Savings() {
  const [savings, setSavings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [form, setForm] = useState({ name: "", target_amount: "", current_amount: "", deadline: "" });
  const [addForm, setAddForm] = useState({ amount: "", note: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/savings");
      setSavings(res.data || []);
    } catch {
      setLoadError("Gagal memuat tabungan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setTimeout(() => fetchData(), 0); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.target_amount) return;
    setIsSaving(true);
    try {
      await api.post("/savings", {
        name: form.name.trim(),
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount || 0),
        deadline: form.deadline || null,
      });
      setForm({ name: "", target_amount: "", current_amount: "", deadline: "" });
      setShowForm(false);
      fetchData();
    } catch {
      setLoadError("Gagal membuat tabungan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tabungan ini?")) return;
    try {
      await api.delete(`/savings/${id}`);
      fetchData();
    } catch {
      setLoadError("Gagal menghapus tabungan.");
    }
  };

  const handleAddAmount = async (savingId) => {
    if (!addForm.amount) return;
    setIsSaving(true);
    try {
      await api.post(`/savings/${savingId}/history`, {
        amount: Number(addForm.amount),
        note: addForm.note || null,
      });
      setAddForm({ amount: "", note: "" });
      fetchData();
      if (showHistory === savingId) {
        const res = await api.get(`/savings/${savingId}/history`);
        setHistoryData(res.data || []);
      }
    } catch {
      setLoadError("Gagal menambahkan ke tabungan.");
    } finally {
      setIsSaving(false);
    }
  };

  const openHistory = async (id) => {
    if (showHistory === id) {
      setShowHistory(null);
      return;
    }
    try {
      const res = await api.get(`/savings/${id}/history`);
      setHistoryData(res.data || []);
      setShowHistory(id);
    } catch {
      setLoadError("Gagal memuat riwayat tabungan.");
    }
  };

  const totalTarget = savings.reduce((s, sv) => s + Number(sv.target_amount || 0), 0);
  const totalCurrent = savings.reduce((s, sv) => s + Number(sv.current_amount || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.min(Math.round((totalCurrent / totalTarget) * 100), 100) : 0;

  if (isLoading) {
    return (
      <div className="empty-state tall" style={{ marginTop: 72 }}>
        <strong>Memuat tabungan...</strong>
      </div>
    );
  }

  return (
    <>
      <section className="category-hero">
        <div>
          <h1>Tabungan</h1>
          <p>Kelola target tabungan dan pantau progresnya.</p>
        </div>
        <button
          className="primary-action"
          onClick={() => setShowForm((v) => !v)}
          type="button"
        >
          + Tambah Tabungan
        </button>
      </section>

      {loadError && <p className="notice">{loadError}</p>}

      {showForm && (
        <form className="category-form" onSubmit={handleCreate}>
          <label>
            Nama tabungan
            <input
              autoFocus
              placeholder="Contoh: Dana Darurat, Liburan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Target (Rp)
            <input
              type="number"
              placeholder="0"
              min="1"
              value={form.target_amount}
              onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
            />
          </label>
          <label>
            Saat ini (Rp)
            <input
              type="number"
              placeholder="0"
              value={form.current_amount}
              onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
            />
          </label>
          <label>
            Deadline
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </label>
          <button disabled={isSaving} type="submit">
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      )}

      <section className="category-summary" aria-label="Ringkasan tabungan">
        <article>
          <span>Total Tabungan</span>
          <strong>{savings.length}</strong>
        </article>
        <article>
          <span>Target Keseluruhan</span>
          <strong>{formatCurrency(totalTarget)}</strong>
        </article>
        <article>
          <span>Terkumpul</span>
          <strong>{formatCurrency(totalCurrent)}</strong>
        </article>
        <article>
          <span>Progres</span>
          <strong>{overallProgress}%</strong>
        </article>
        <article>
          <span>Sisa</span>
          <strong>{formatCurrency(Math.max(totalTarget - totalCurrent, 0))}</strong>
        </article>
      </section>

      <section className="category-grid" aria-label="Daftar tabungan">
        {savings.map((sv) => {
          const progress = Number(sv.target_amount) > 0
            ? Math.min(Math.round((Number(sv.current_amount) / Number(sv.target_amount)) * 100), 100)
            : 0;
          return (
            <article className="category-card" key={sv.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="category-icon violet">
                  <PiggyBank size={20} strokeWidth={2} />
                </div>
                <button
                  onClick={() => handleDelete(sv.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: "18px", padding: "4px 8px", cursor: "pointer" }}
                  title="Hapus tabungan"
                  type="button"
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </div>
              <h2>{sv.name}</h2>
              <p>
                {sv.deadline
                  ? `Deadline: ${new Date(sv.deadline).toLocaleDateString("id-ID")}`
                  : "Tanpa deadline"}
              </p>
              <div className="category-row">
                <span>Progres</span>
                <strong>{progress}%</strong>
              </div>
              <div className="category-progress">
                <span className="violet" style={{ width: `${progress}%` }} />
              </div>
              <div className="category-row">
                <span>Terkumpul</span>
                <strong>{formatCurrency(sv.current_amount)}</strong>
              </div>
              <div className="category-row" style={{ marginTop: 4 }}>
                <span>Target</span>
                <strong>{formatCurrency(sv.target_amount)}</strong>
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Jumlah"
                    min="1"
                    value={addForm.amount}
                    onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                    style={{
                      flex: 1,
                      minHeight: 34,
                      padding: "0 10px",
                      color: "var(--heading)",
                      background: "var(--blue-50)",
                      border: "1.5px solid var(--line)",
                      borderRadius: "var(--radius-sm)",
                      font: "inherit",
                      fontSize: 12,
                    }}
                  />
                  <button
                    onClick={() => handleAddAmount(sv.id)}
                    disabled={isSaving}
                    style={{
                      minHeight: 34,
                      padding: "0 12px",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 12,
                      background: "linear-gradient(135deg, var(--blue-600), var(--blue-500))",
                      border: 0,
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    <TrendingUp size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <button
                  onClick={() => openHistory(sv.id)}
                  className="link-button"
                  type="button"
                  style={{ fontSize: 12, textAlign: "left" }}
                >
                  {showHistory === sv.id ? "Sembunyikan riwayat" : "Lihat riwayat"}
                </button>
                {showHistory === sv.id && (
                  <div style={{ maxHeight: 160, overflowY: "auto", display: "grid", gap: 4 }}>
                    {historyData.length > 0 ? (
                      historyData.map((h) => (
                        <div
                          key={h.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "6px 8px",
                            background: "var(--blue-50)",
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "var(--heading)", fontWeight: 600 }}>
                            +{formatCurrency(h.amount)}
                          </span>
                          <span style={{ color: "var(--text-light)", fontSize: 11 }}>
                            {h.note || "-"} · {new Date(h.created_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: "var(--text-light)", fontSize: 12 }}>Belum ada riwayat.</span>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}

        <button className="create-category-card" onClick={() => setShowForm(true)} type="button">
          <span>+</span>
          <strong>Buat Tabungan Baru</strong>
        </button>
      </section>

      {savings.length === 0 && !showForm && (
        <div className="empty-state tall category-empty">
          <strong>Belum ada tabungan</strong>
          <span>Buat target tabungan pertama untuk mulai menabung.</span>
        </div>
      )}
    </>
  );
}

export default Savings;
