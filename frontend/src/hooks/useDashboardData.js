import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { monthNames, dayNames } from "../utils/format";

export const periods = [
  { key: "hari", label: "Hari Ini" },
  { key: "7hari", label: "7 Hari" },
  { key: "1bulan", label: "1 Bulan" },
  { key: "3bulan", label: "3 Bulan" },
  { key: "6bulan", label: "6 Bulan" },
  { key: "1tahun", label: "1 Tahun" },
];

export const summaryPeriods = [
  { key: "1bulan", label: "1 Bulan" },
  { key: "3bulan", label: "3 Bulan" },
  { key: "6bulan", label: "6 Bulan" },
  { key: "1tahun", label: "1 Tahun" },
];

export function useDashboardData() {
  const [summary, setSummary] = useState({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldo: 0,
  });
  const [allTransactions, setAllTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [period, setPeriod] = useState("1tahun");
  const [summaryPeriod, setSummaryPeriod] = useState("1tahun");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      setLoadError("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const [summaryResponse, transactionsResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/transactions"),
      ]);
      setSummary(summaryResponse.data);
      setAllTransactions(transactionsResponse.data);
      setLoadError("");
      setLastUpdated(new Date());
    } catch (err) {
      setAllTransactions([]);
      if (err.response) {
        if (err.response.status === 401) {
          setLoadError("Sesi telah berakhir. Silakan login ulang.");
        } else {
          setLoadError("Terjadi kesalahan pada server. Coba muat ulang.");
        }
      } else if (err.request) {
        setLoadError(
          "Tidak dapat terhubung ke server. Periksa koneksi internet.",
        );
      } else {
        setLoadError("Gagal memuat data. Coba muat ulang.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const filteredSummary = useMemo(() => {
    const now = new Date();
    let cutoff;
    switch (summaryPeriod) {
      case "1bulan":
        cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "3bulan":
        cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "6bulan":
        cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "1tahun":
      default:
        cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    allTransactions.forEach((t) => {
      if (!t.transaction_date) return;
      const d = new Date(t.transaction_date);
      if (d >= cutoff) {
        if (t.type === "pemasukan") totalPemasukan += Number(t.amount || 0);
        else totalPengeluaran += Number(t.amount || 0);
      }
    });
    return {
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
    };
  }, [allTransactions, summaryPeriod]);

  const summaryComparison = useMemo(() => {
    const now = new Date();
    const periodMonths =
      summaryPeriod === "1bulan"
        ? 1
        : summaryPeriod === "3bulan"
          ? 3
          : summaryPeriod === "6bulan"
            ? 6
            : 12;

    const currentStart = new Date(now);
    currentStart.setMonth(currentStart.getMonth() - periodMonths);

    const previousStart = new Date(currentStart);
    previousStart.setMonth(previousStart.getMonth() - periodMonths);

    const totals = {
      current: { income: 0, expense: 0 },
      previous: { income: 0, expense: 0 },
    };

    allTransactions.forEach((t) => {
      if (!t.transaction_date) return;
      const date = new Date(t.transaction_date);

      if (date >= currentStart && date <= now) {
        if (t.type === "pemasukan")
          totals.current.income += Number(t.amount || 0);
        else totals.current.expense += Number(t.amount || 0);
      } else if (date >= previousStart && date < currentStart) {
        if (t.type === "pemasukan")
          totals.previous.income += Number(t.amount || 0);
        else totals.previous.expense += Number(t.amount || 0);
      }
    });

    const calcChange = (current, previous) => {
      if (previous === 0) {
        return {
          percent: current === 0 ? 0 : 100,
          direction: current >= 0 ? "up" : "down",
        };
      }
      const raw = ((current - previous) / previous) * 100;
      return {
        percent: Math.abs(Math.round(raw * 10) / 10),
        direction: raw >= 0 ? "up" : "down",
      };
    };

    const comparisonLabel =
      summaryPeriod === "1bulan"
        ? "Sejak bulan lalu"
        : summaryPeriod === "3bulan"
          ? "Dibandingkan 3 bulan lalu"
          : summaryPeriod === "6bulan"
            ? "Dibandingkan 6 bulan lalu"
            : "Dibandingkan tahun lalu";

    return {
      income: {
        ...calcChange(totals.current.income, totals.previous.income),
        label: comparisonLabel,
      },
      expense: {
        ...calcChange(totals.current.expense, totals.previous.expense),
        label: comparisonLabel,
      },
    };
  }, [allTransactions, summaryPeriod]);

  const hasFinanceData =
    Number(summary.totalPemasukan) > 0 ||
    Number(summary.totalPengeluaran) > 0 ||
    Number(summary.saldo) > 0 ||
    allTransactions.length > 0;

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate, groupFn, labelFn, numPoints;

    switch (period) {
      case "hari":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        groupFn = (date) => date.getHours();
        labelFn = (h) => `${h}`;
        numPoints = 24;
        break;
      case "7hari":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        groupFn = (date) =>
          Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        labelFn = (i) => {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          return dayNames[d.getDay()];
        };
        numPoints = 7;
        break;
      case "1bulan":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 27);
        startDate.setHours(0, 0, 0, 0);
        groupFn = (date) =>
          Math.floor(Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) / 7);
        labelFn = (i) => `Minggu ${i + 1}`;
        numPoints = 4;
        break;
      case "3bulan":
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        groupFn = (date) =>
          (date.getFullYear() - startDate.getFullYear()) * 12 +
          date.getMonth() -
          startDate.getMonth();
        labelFn = (i) => {
          const m = (startDate.getMonth() + i) % 12;
          return monthNames[m];
        };
        numPoints = 3;
        break;
      case "6bulan":
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        groupFn = (date) =>
          (date.getFullYear() - startDate.getFullYear()) * 12 +
          date.getMonth() -
          startDate.getMonth();
        labelFn = (i) => {
          const m = (startDate.getMonth() + i) % 12;
          return monthNames[m];
        };
        numPoints = 6;
        break;
      case "1tahun":
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        groupFn = (date) => date.getMonth();
        labelFn = (i) => monthNames[i];
        numPoints = 12;
        break;
    }

    const data = Array.from({ length: numPoints }, (_, i) => ({
      label: labelFn(i),
      value: null,
    }));

    allTransactions.forEach((t) => {
      if (!t.transaction_date) return;
      const date = new Date(t.transaction_date);
      if (date < startDate || date > now) return;
      const index = groupFn(date);
      if (index >= 0 && index < numPoints) {
        if (data[index].value === null) data[index].value = 0;
        if (t.type === "pemasukan") {
          data[index].value += Number(t.amount || 0);
        } else {
          data[index].value -= Number(t.amount || 0);
        }
      }
    });

    return data;
  }, [allTransactions, period]);

  const categoryData = useMemo(() => {
    const totals = allTransactions
      .filter((t) => t.type === "pengeluaran")
      .reduce((result, t) => {
        const category = t.category_name || "Lainnya";
        result[category] = (result[category] || 0) + Number(t.amount || 0);
        return result;
      }, {});
    const total = Object.values(totals).reduce((sum, v) => sum + v, 0);
    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [allTransactions]);

  const hasChartData = chartData.some(
    (item) => item.value !== null && item.value !== 0,
  );
  const categoryTotal = categoryData.reduce((total, c) => total + c.value, 0);
  const currentSavings = Math.max(Number(summary.saldo) || 0, 0);
  const savingsTargetInitial =
    Number(localStorage.getItem("savingsTarget")) || 5000000;

  return {
    summary,
    allTransactions,
    isLoading,
    loadError,
    period,
    setPeriod,
    summaryPeriod,
    setSummaryPeriod,
    lastUpdated,
    categories,
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
  };
}
