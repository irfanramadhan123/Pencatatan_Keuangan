import { useState } from "react";

export default function SavingsModal({ show, onClose, currentTarget, onSave }) {
  const [savingsInput, setSavingsInput] = useState(String(currentTarget));

  const handleSave = () => {
    const val = Number(savingsInput);
    if (val > 0) {
      onSave(val);
    }
    onClose();
    setSavingsInput("");
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
        <div className="modal-form">
          <label>
            Target Tabungan (Rp)
            <input type="number" placeholder="5000000" min="1" value={savingsInput} onChange={(e) => setSavingsInput(e.target.value)} />
          </label>
          <button type="button" className="modal-submit" onClick={handleSave}>Simpan Target</button>
        </div>
      </div>
    </div>
  );
}
