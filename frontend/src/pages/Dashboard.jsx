import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, TrendingDown, Plus } from "lucide-react";
import {
  useDashboardData,
  periods,
  summaryPeriods,
} from "../hooks/useDashboardData";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import PeriodTabs from "../components/dashboard/PeriodTabs";
import SummaryPeriodTabs from "../components/dashboard/SummaryPeriodTabs";
import MetricCard from "../components/dashboard/MetricCard";
import SavingsCard from "../components/dashboard/SavingsCard";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";
import TransactionList from "../components/transactions/TransactionList";
import ActivityTimeline from "../components/transactions/ActivityTimeline";
import TransactionModal from "../components/transactions/TransactionModal";
import SavingsModal from "../components/dashboard/SavingsModal";

const cardMeta = [
  {
    icon: Wallet,
    tone: "violet",
    label: "Saldo Saat Ini",
    isSaldo: true,
    hideSparkline: true,
    helper: (hf) =>
      hf ? "Pemasukan dikurangi pengeluaran" : "Belum ada transaksi",
  },
  {
    icon: TrendingUp,
    tone: "green",
    label: "Pemasukan",
    helper: () => "Total pemasukan periode ini",
    trendKey: "income",
  },
  {
    icon: TrendingDown,
    tone: "red",
    label: "Pengeluaran",
    helper: () => "Total pengeluaran periode ini",
    trendKey: "expense",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const {
    allTransactions,
    isLoading,
    loadError,
    period,
    setPeriod,
    summaryPeriod,
    setSummaryPeriod,
    fetchDashboard,
    filteredSummary,
    summaryComparison,
    hasFinanceData,
    chartData,
    categoryData,
    hasChartData,
    categoryTotal,
    currentSavings,
    savingsTargetInitial,
  } = useDashboardData();

  const [savingsTarget, setSavingsTarget] = useState(
    () => savingsTargetInitial,
  );
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);

  const sparklineData = chartData.map((m) => m.value !== null ? Math.abs(m.value) : 0);
  const savingsProgress =
    savingsTarget > 0
      ? Math.min(Math.round((currentSavings / savingsTarget) * 100), 100)
      : 0;
  const latestTransactions = allTransactions.slice(0, 5);

  const handleSetSavingsTarget = (val) => {
    setSavingsTarget(val);
    localStorage.setItem("savingsTarget", String(val));
  };

  if (isLoading) return <LoadingState />;
  if (loadError && allTransactions.length === 0)
    return <ErrorState message={loadError} onRetry={fetchDashboard} />;

  return (
    <>
      <section className="welcome">
        <div>
          <h1>Dashboard Keuangan</h1>
          <p>Pantau saldo, pemasukan, pengeluaran, dan transaksi terbaru.</p>
        </div>
      </section>

      {loadError && (
        <div className="notice notice-warning">
          <span>{loadError}</span>
          <button
            className="notice-retry"
            onClick={fetchDashboard}
            type="button"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <SummaryPeriodTabs
        periods={summaryPeriods}
        summaryPeriod={summaryPeriod}
        onChange={setSummaryPeriod}
      />

      <section className="summary-grid" aria-label="Ringkasan keuangan">
        {cardMeta.map((meta) => (
          <MetricCard
            key={meta.label}
            icon={meta.icon}
            tone={meta.tone}
            label={meta.label}
            value={
              meta.label === "Saldo Saat Ini"
                ? filteredSummary.saldo
                : meta.label === "Pemasukan"
                  ? filteredSummary.totalPemasukan
                  : filteredSummary.totalPengeluaran
            }
            helper={meta.helper(hasFinanceData)}
            sparklineData={sparklineData}
            hasFinanceData={hasFinanceData}
            trend={meta.trendKey ? summaryComparison[meta.trendKey] : undefined}
            showSparkline={!meta.trendKey && !meta.hideSparkline}
            isSaldo={meta.isSaldo}
            invertDelta={meta.trendKey === "expense"}
          />
        ))}
        <SavingsCard
          currentSavings={currentSavings}
          savingsTarget={savingsTarget}
          savingsProgress={savingsProgress}
          onSetTarget={() => setShowSavingsModal(true)}
        />
      </section>

      <section className="content-grid">
        <article className="panel wide">
          <div className="panel-title">
            <div>
              <h2>Cash Flow</h2>
              <p>
                Arus kas bersih per periode
              </p>
            </div>
          </div>
          <PeriodTabs periods={periods} period={period} onChange={setPeriod} />
          {hasChartData ? (
            <LineChart chartData={chartData} period={period} />
          ) : (
            <div className="empty-state tall actionable">
              <div className="empty-state-icon">📊</div>
              <strong>Belum ada data grafik</strong>
              <span>
                Mulai catat pemasukan atau pengeluaran untuk melihat grafik
                keuanganmu.
              </span>
              <button
                className="empty-action-btn"
                onClick={() => setShowTransactionModal(true)}
                type="button"
              >
                + Catat transaksi pertama
              </button>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Pengeluaran per Kategori</h2>
              <p>Bulan ini</p>
            </div>
          </div>
          <DonutChart
            categoryData={categoryData}
            categoryTotal={categoryTotal}
            hasData={categoryTotal > 0}
          />
          {categoryTotal === 0 && (
            <div className="empty-state actionable">
              <div className="empty-state-icon">🏷️</div>
              <strong>Belum ada pengeluaran</strong>
              <span>
                Catat pengeluaran pertamamu untuk melihat distribusi per
                kategori.
              </span>
              <button
                className="empty-action-btn"
                onClick={() => setShowTransactionModal(true)}
                type="button"
              >
                + Catat pengeluaran
              </button>
            </div>
          )}
        </article>

        <article className="panel wide">
          <div className="panel-title">
            <div>
              <h2>Transaksi Terbaru</h2>
            </div>
            <button
              className="link-button"
              onClick={() => navigate("/transaksi")}
            >
              Lihat Semua
            </button>
          </div>
          <TransactionList
            transactions={latestTransactions}
            onEmptyAction={() => setShowTransactionModal(true)}
          />
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Aktivitas</h2>
            </div>
          </div>
          <ActivityTimeline
            transactions={allTransactions}
            onEmptyAction={() => setShowTransactionModal(true)}
          />
        </article>
      </section>

      <button
        className="fab"
        onClick={() => setShowTransactionModal(true)}
        type="button"
        aria-label="Tambah Transaksi"
      >
        <span className="fab-icon">
          <Plus size={24} strokeWidth={3} />
        </span>
        <span className="fab-label">Tambah Transaksi</span>
      </button>

      <TransactionModal
        show={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={fetchDashboard}
      />

      <SavingsModal
        show={showSavingsModal}
        onClose={() => setShowSavingsModal(false)}
        currentTarget={savingsTarget}
        onSave={handleSetSavingsTarget}
      />
    </>
  );
}

export default Dashboard;
