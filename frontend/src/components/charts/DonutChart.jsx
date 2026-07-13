import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "../../utils/format";

const pieColors = ["#f5f3ff", "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#3b0764", "#2e1065", "#1e0a3c"];
const getColor = (i) => pieColors[i % pieColors.length];

export default function DonutChart({ categoryData, categoryTotal, hasData }) {
  const [tooltip, setTooltip] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  if (!hasData) return null;

  const total = categoryData.reduce((s, c) => s + c.value, 0);
  const gap = 5;

  const arcs = [];
  let current = 0;
  categoryData.forEach((c, i) => {
    const pct = total > 0 ? (c.value / total) * 100 : 0;
    const effectivePct = pct - gap;
    arcs.push({ ...c, start: current, end: current + Math.max(effectivePct, 0), color: getColor(i) });
    current += pct;
  });

  const handleMouseEnter = (data, i, e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
    setTooltip(data);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <>
      <div className="donut-wrap" ref={wrapRef} style={{ position: "relative" }}>
        <div className="donut">
          <svg viewBox="0 0 36 36" style={{ width: 170, height: 170, transform: "rotate(-90deg)" }}>
            {arcs.map((s, i) => (
              <circle
                key={s.name}
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={s.color}
                strokeWidth={4.2}
                strokeDasharray={`${s.end - s.start} ${100 - (s.end - s.start)}`}
                strokeDashoffset={-s.start}
                strokeLinecap="round"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => handleMouseEnter(s, i, e)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
            <circle cx="18" cy="18" r="11" fill="var(--surface)" />
          </svg>
        </div>
        {tooltip && (
          <div className="donut-tooltip" style={{ left: pos.x, top: pos.y }}>
            <span className="donut-tooltip-name">{tooltip.name}</span>
            <span className="donut-tooltip-value">{formatCurrency(tooltip.value)}</span>
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: -8, marginBottom: 12 }}>
        <strong style={{ color: "var(--heading)", fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(categoryTotal)}
        </strong>
        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginTop: 2 }}>
          Total Terpakai
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <button className="category-legend-trigger" onClick={() => setOpen(!open)} type="button">
          <span>Lihat Kategori ({categoryData.length})</span>
          <ChevronDown size={14} strokeWidth={2.5} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
        </button>
        {open && (
          <div className="category-legend-dropdown">
            {categoryData.map((category, index) => (
              <div key={category.name} className="category-legend-item">
                <i style={{ background: getColor(index) }} />
                <span className="category-legend-name">{category.name}</span>
                <span className="category-legend-pct">{category.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}