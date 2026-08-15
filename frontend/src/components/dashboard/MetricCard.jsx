import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import { formatCurrency } from "../../utils/format";
import Sparkline from "../charts/Sparkline";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MetricCard({
  icon: Icon,
  tone,
  label,
  value,
  helper,
  sparklineData,
  hasFinanceData,
  trend,
  showSparkline = true,
  isSaldo,
  invertDelta = false,
}) {
  const animatedRef = useAnimatedNumber(value);
  const trendUp = trend?.direction === "up";
  const deltaClass = trendUp !== invertDelta ? "up" : "down";

  return (
    <article className={`metric-card${trend ? " metric-card-trend" : ""}${isSaldo ? " metric-card-saldo" : ""}`}>
      <div className="metric-head">
        <span className={`metric-icon ${tone}`}>
          <Icon size={24} strokeWidth={2.5} />
        </span>
        <p>{label}</p>
      </div>
      <strong ref={animatedRef}>{formatCurrency(value)}</strong>
      {trend ? (
        <>
          <span className={`metric-delta ${deltaClass}`}>
            {trendUp ? (
              <ArrowUpRight size={21} strokeWidth={3} />
            ) : (
              <ArrowDownRight size={21} strokeWidth={3} />
            )}
            {trend.percent}%
          </span>
          <span className="metric-trend-text">{trend.label}</span>
        </>
      ) : showSparkline ? (
        hasFinanceData ? (
          <Sparkline values={sparklineData} tone={tone} />
        ) : (
          <div className="mini-empty">Belum ada grafik</div>
        )
      ) : (
        <small className={tone}>{helper}</small>
      )}
    </article>
  );
}
