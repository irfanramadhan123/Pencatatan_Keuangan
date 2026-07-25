import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/format";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{label}</span>
      <span className={`chart-tooltip-value ${value >= 0 ? "positive" : "negative"}`}>
        {value >= 0 ? "+" : ""}{formatCurrency(value)}
      </span>
    </div>
  );
}

export default function LineChart({ chartData }) {
  return (
    <div className="line-chart">
      <ResponsiveContainer width="100%" height={235}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
          <defs>
            <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            fill="url(#cashflowGrad)"
            strokeWidth={3}
            connectNulls={true}
            dot={false}
            activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}