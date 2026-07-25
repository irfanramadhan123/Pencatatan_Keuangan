import { useState } from "react";
import api from "../../services/api";

export default function SavingsModal({ show, onClose, currentTarget, onSave }) {
  const [savingsInput, setSavingsInput] = useState(String(currentTarget || ""));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const val = Number(savingsInput);
    if (val > 0) {
      setIsSaving(true);
      setError("");
      try {
        await api.put("/auth/me", { savings_target: val });
        onSave(val);
      } catch {
        setError("Gagal menyimpan target tabungan.");
      } finally {
        setIsSaving(false);
      }
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Atur Target Tabungan</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Tutup">
            <span />
          </button>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-form">
          <label>
            Target Tabungan (Rp)
            <input type="number" placeholder="5000000" min="1" value={savingsInput} onChange={(e) => setSavingsInput(e.target.value)} />
          </label>
          <button type="button" className="modal-submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Target"}
          </button>
        </div>
      </div>
    </div>
  );
}
