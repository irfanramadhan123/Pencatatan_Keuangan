import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDate } from "../../utils/format";
import EmptyState from "../common/EmptyState";

export default function ActivityTimeline({ transactions, onEmptyAction }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="🕑"
        title="Belum ada aktivitas"
        description="Aktivitas akan muncul setelah kamu mencatat transaksi pertama."
        actionLabel="+ Mulai mencatat"
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="timeline">
      {transactions.slice(0, 4).map((transaction) => (
        <div key={`activity-${transaction.id}`}>
          <span className={`timeline-dot ${transaction.type === "pemasukan" ? "income-bg" : "expense-bg"}`}>{transaction.type === "pemasukan" ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownRight size={18} strokeWidth={3} />}</span>
          <strong>{transaction.type === "pemasukan" ? "Pemasukan dicatat" : "Pengeluaran dicatat"}</strong>
          <p>{transaction.description || transaction.category_name || "Transaksi baru"}</p>
          <small>{formatDate(transaction.transaction_date)}</small>
        </div>
      ))}
    </div>
  );
}
