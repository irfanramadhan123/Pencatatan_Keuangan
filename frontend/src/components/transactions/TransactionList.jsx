import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import EmptyState from "../common/EmptyState";

export default function TransactionList({ transactions, onEmptyAction }) {

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="Belum ada transaksi"
        description="Tambahkan transaksi pertama untuk mulai mencatat keuangan."
        actionLabel="+ Catat transaksi pertama"
        onAction={onEmptyAction}
        tall
      />
    );
  }

  return (
    <div className="transaction-table">
      <div className="table-row table-head">
        <span>Transaksi</span>
        <span>Kategori</span>
        <span>Tanggal</span>
        <span>Nominal</span>
      </div>
      {transactions.map((transaction) => (
        <div className="table-row" key={transaction.id}>
          <span className="transaction-name">
            <span className={transaction.type === "pemasukan" ? "income-bg" : "expense-bg"}>
              {transaction.type === "pemasukan" ? <TrendingUp size={21} strokeWidth={2.5} /> : <TrendingDown size={21} strokeWidth={2.5} />}
            </span>
            {transaction.description || "Transaksi"}
          </span>
          <span>
            <mark className={transaction.type === "pemasukan" ? "income" : "expense"}>
              {transaction.category_name || "Umum"}
            </mark>
          </span>
          <span>{formatDate(transaction.transaction_date)}</span>
          <strong className={transaction.type === "pemasukan" ? "positive" : "negative"}>
            {transaction.type === "pemasukan" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </strong>
        </div>
      ))}
    </div>
  );
}
