import { useEffect, useState } from "react";
import api from "../services/api";
import { Wallet, Trash2, Pencil } from "lucide-react";

function FundSources() {
  const [fundSources, setFundSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/fund-sources");
      setFundSources(res.data || []);
    } catch {
      setLoadError("Gagal memuat sumber dana.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setTimeout(() => fetchData(), 0); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await api.post("/fund-sources", { name: newName.trim() });
      setNewName("");
      setShowForm(false);
      fetchData();
    } catch {
      setLoadError("Gagal membuat sumber dana.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (fs) => {
    setEditId(fs.id);
    setEditName(fs.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await api.put(`/fund-sources/${editId}`, { name: editName.trim() });
      setEditId(null);
      setEditName("");
      fetchData();
    } catch {
      setLoadError("Gagal mengupdate sumber dana.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus sumber dana ini?")) return;
    try {
      await api.delete(`/fund-sources/${id}`);
      fetchData();
    } catch {
      setLoadError("Gagal menghapus sumber dana.");
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state tall" style={{ marginTop: 72 }}>
        <strong>Memuat sumber dana...</strong>
      </div>
    );
  }

  return (
    <>
      <section className="category-hero">
        <div>
          <h1>Sumber Dana</h1>
          <p>Kelola asal dana untuk setiap transaksi keuanganmu.</p>
        </div>
        <button
          className="primary-action"
          onClick={() => setShowForm((v) => !v)}
          type="button"
        >
          + Tambah Sumber Dana
        </button>
      </section>

      {loadError && <p className="notice">{loadError}</p>}

      {showForm && (
        <form className="category-form" onSubmit={handleSubmit}>
          <label>
            Nama sumber dana
            <input
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: BCA, GoPay, Cash"
              value={newName}
            />
          </label>
          <button disabled={isSaving} type="submit">
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      )}

      <section className="category-summary" aria-label="Ringkasan sumber dana">
        <article>
          <span>Total Sumber Dana</span>
          <strong>{fundSources.length}</strong>
        </article>
      </section>

      <section className="category-grid" aria-label="Daftar sumber dana">
        {fundSources.map((fs) => (
          <article className="category-card" key={fs.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="category-icon blue">
                <Wallet size={20} strokeWidth={2} />
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => handleEdit(fs)}
                  style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: "18px", padding: "4px 8px", cursor: "pointer" }}
                  title="Edit sumber dana"
                  type="button"
                >
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button
                  onClick={() => handleDelete(fs.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: "18px", padding: "4px 8px", cursor: "pointer" }}
                  title="Hapus sumber dana"
                  type="button"
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
            {editId === fs.id ? (
              <form onSubmit={handleUpdate} style={{ marginTop: 8 }}>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button disabled={isSaving} type="submit" className="primary-action" style={{ flex: 1 }}>
                    {isSaving ? "..." : "Simpan"}
                  </button>
                  <button type="button" className="link-button" onClick={() => setEditId(null)}>
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <h2>{fs.name}</h2>
            )}
            <p>Dibuat {fs.created_at ? new Date(fs.created_at).toLocaleDateString("id-ID") : "-"}</p>
          </article>
        ))}

        <button className="create-category-card" onClick={() => setShowForm(true)} type="button">
          <span>+</span>
          <strong>Buat Sumber Dana Baru</strong>
        </button>
      </section>

      {fundSources.length === 0 && !showForm && (
        <div className="empty-state tall category-empty">
          <strong>Belum ada sumber dana</strong>
          <span>Tambahkan sumber dana pertama untuk mengkategorikan asal transaksi.</span>
        </div>
      )}
    </>
  );
}

export default FundSources;
