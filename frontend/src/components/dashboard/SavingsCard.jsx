import { formatCurrency } from "../../utils/format";
import { PiggyBank } from "lucide-react";

export default function SavingsCard({ currentSavings, savingsTarget, savingsProgress, onSetTarget }) {
  return (
    <article className="metric-card">
      <div className="metric-head">
        <span className="metric-icon blue">
          <PiggyBank size={24} strokeWidth={2.5} />
        </span>
        <p>Target Tabungan</p>
      </div>
      <strong>{formatCurrency(currentSavings)}</strong>
      <div className="progress-track">
        <span style={{ width: `${savingsProgress}%` }} />
      </div>
      <div className="progress-detail">
        {formatCurrency(currentSavings)} dari {formatCurrency(savingsTarget)} ({savingsProgress}%)
      </div>
      <button className="savings-target-btn" onClick={onSetTarget} type="button">
        Atur Target
      </button>
    </article>
  );
}
