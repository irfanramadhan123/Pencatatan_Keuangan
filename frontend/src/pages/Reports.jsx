import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

const reportTabs = ["Semua", "Bulanan", "Kuartal", "Tahunan"];

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getPeriodKey(date, type) {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (type === "Tahunan") return `${year}`;
  if (type === "Kuartal") return `${year}-Q${Math.floor(month / 3) + 1}`;
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getPeriodTitle(key, type) {
  if (type === "Tahunan") return `Laporan Tahunan ${key}`;
  if (type === "Kuartal") {
    const [year, quarter] = key.split("-");
    return `Laporan ${quarter} ${year}`;
  }
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date);
}

function groupReports(transactions, type) {
  const groups = transactions.reduce((result, transaction) => {
    const date = new Date(transaction.transaction_date);
    const key = getPeriodKey(date, type);
    if (!result[key]) {
      result[key] = { key, type, income: 0, expense: 0, startDate: date, endDate: date };
    }
    if (transaction.type === "pemasukan") {
      result[key].income += Number(transaction.amount || 0);
    } else {
      result[key].expense += Number(transaction.amount || 0);
    }
    if (date < result[key].startDate) result[key].startDate = date;
    if (date > result[key].endDate) result[key].endDate = date;
    return result;
  }, {});
  return Object.values(groups)
    .map((report) => ({
      ...report,
      title: getPeriodTitle(report.key, report.type),
      net: report.income - report.expense,
      status: report.income > 0 || report.expense > 0 ? "Selesai" : "Kosong",
    }))
    .sort((a, b) => b.endDate - a.endDate);
}

function downloadReport(report) {
  const rows = [
    ["Periode", report.title],
    ["Jenis", report.type],
    ["Tanggal Awal", formatDate(report.startDate)],
    ["Tanggal Akhir", formatDate(report.endDate)],
    ["Pemasukan", report.income],
    ["Pengeluaran", report.expense],
    ["Saldo Bersih", report.net],
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.title.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let shouldUpdate = true;
    api.get("/transactions?limit=99999")
      .then((response) => {
        if (!shouldUpdate) return;
        const txData = response.data;
        setTransactions(Array.isArray(txData) ? txData : (txData.data || []));
        setLoadError("");
      })
      .catch(() => {
        if (!shouldUpdate) return;
        setTransactions([]);
        setLoadError("Data laporan belum bisa dimuat. Pastikan backend berjalan dan akun sudah login.");
      });
    return () => { shouldUpdate = false; };
  }, []);

  const reports = useMemo(() => {
    const allReports = [
      ...groupReports(transactions, "Tahunan"),
      ...groupReports(transactions, "Kuartal"),
      ...groupReports(transactions, "Bulanan"),
    ];
    return allReports
      .filter((r) => activeTab === "Semua" || r.type === activeTab)
      .filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.endDate - a.endDate);
  }, [activeTab, search, transactions]);

  const totalIncome = transactions
    .filter((t) => t.type === "pemasukan")
    .reduce((total, t) => total + Number(t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "pengeluaran")
    .reduce((total, t) => total + Number(t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;
  const verifiedReports = reports.filter((r) => r.status === "Selesai").length;

  return (
    <>
      <section className="report-hero">
        <div>
          <h1>Laporan Keuangan</h1>
          <p>Ringkasan pemasukan, pengeluaran, dan saldo bersih berdasarkan transaksi akun ini.</p>
        </div>
        <div className="report-actions">
          <label className="search-box" style={{ width: '220px' }}>
            <span className="search-icon" />
            <input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari laporan..."
              value={search}
            />
          </label>
        </div>
      </section>

      {loadError && <p className="notice">{loadError}</p>}

      <section className="report-highlight">
        <article className="report-performance">
          <span>Performa Keseluruhan</span>
          <strong>{formatCurrency(netBalance)}</strong>
          <p>Pemasukan {formatCurrency(totalIncome)} dan pengeluaran {formatCurrency(totalExpense)}</p>
        </article>
        <article className="report-verification">
          <strong>{verifiedReports} laporan siap dilihat</strong>
          <span>Laporan dibuat otomatis dari transaksi yang sudah tersimpan di akun.</span>
        </article>
      </section>

      <section className="report-tabs" aria-label="Filter laporan">
        {reportTabs.map((tab) => (
          <button className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)} type="button">
            {tab}
          </button>
        ))}
      </section>

      <section className="report-list" aria-label="Daftar laporan">
        {reports.length > 0 && (
          <div className="report-row report-head">
            <span>Periode Laporan</span>
            <span>Ringkasan</span>
            <span>Status</span>
            <span>Aksi</span>
          </div>
        )}
        {reports.length > 0 ? (
          reports.map((report) => (
            <article className="report-row" key={`${report.type}-${report.key}`}>
              <div className="report-name">
                <i />
                <div>
                  <strong>{report.title}</strong>
                  <span>{formatDate(report.startDate)} - {formatDate(report.endDate)}</span>
                </div>
              </div>
              <div className="report-summary-lines">
                <span className="income-line-chip">{formatCurrency(report.income)}</span>
                <span className="expense-line-chip">{formatCurrency(report.expense)}</span>
              </div>
              <mark className={report.status === "Selesai" ? "income" : "expense"}>{report.status}</mark>
              <button className="download-button report-row-actions" onClick={() => downloadReport(report)} type="button">
                Download CSV
              </button>
            </article>
          ))
        ) : (
          <div className="empty-state tall">
            <strong>Belum ada laporan</strong>
            <span>Laporan akan muncul otomatis setelah kamu menambahkan transaksi pemasukan atau pengeluaran.</span>
          </div>
        )}
      </section>

      <footer className="report-footer">
        Data laporan dihitung dari transaksi akun yang sedang login.
      </footer>
    </>
  );
}

export default Reports;
