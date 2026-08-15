import { useRef, useState } from "react";
import { formatCurrency } from "../../utils/format";

const pieColors = [
  "#10B981",
  "#34D399",
  "#059669",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#84CC16",
  "#EAB308",
  "#F59E0B",
  "#F97316",
];

const getColor = (index) => pieColors[index % pieColors.length];

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const arcSize = endAngle - startAngle;
  const largeArcFlag = arcSize > 180 ? 1 : 0;

  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
  ].join(" ");
}

function createArcs(categories, total, visibleCategoryCount, ringRadius, strokeWidth) {
  const gapAngle = 2;
  const capAngle =
    (Math.asin((strokeWidth / 2) / ringRadius) * 180) / Math.PI;
  let currentAngle = 0;

  return categories
    .map((category, index) => {
      const value = Math.max(Number(category.value) || 0, 0);
      const angle = total > 0 ? (value / total) * 360 : 0;
      const rawStartAngle = currentAngle;
      const rawEndAngle = currentAngle + angle;

      currentAngle = rawEndAngle;

      if (angle <= 0) return null;

      const isSingleCategory = visibleCategoryCount === 1;
      const insetAngle = isSingleCategory ? 0 : capAngle + gapAngle / 2;
      const startAngle = rawStartAngle + insetAngle;
      const endAngle = rawEndAngle - insetAngle;

      if (!isSingleCategory && endAngle <= startAngle) return null;

      const midpoint = (rawStartAngle + rawEndAngle) / 2;
      const direction = polarToCartesian(0, 0, 1, midpoint);

      return {
        ...category,
        index,
        color: getColor(index),
        startAngle,
        endAngle: isSingleCategory ? rawEndAngle - 0.001 : endAngle,
        translateX: direction.x * 3,
        translateY: direction.y * 3,
      };
    })
    .filter(Boolean);
}

export default function DonutChart({ categoryData, categoryTotal, hasData }) {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  if (!hasData) return null;

  const center = 90;
  const ringRadius = 59;
  const strokeWidth = 18;
  const categories = Array.isArray(categoryData) ? categoryData : [];
  const total = categories.reduce(
    (sum, category) => sum + Math.max(Number(category.value) || 0, 0),
    0,
  );

  const visibleCategoryCount = categories.filter(
    (category) => (Number(category.value) || 0) > 0,
  ).length;

  const arcs = createArcs(
    categories,
    total,
    visibleCategoryCount,
    ringRadius,
    strokeWidth,
  );

  const updateTooltipPosition = (event) => {
    if (!wrapRef.current) return;

    const rect = wrapRef.current.getBoundingClientRect();

    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 12,
    });
  };

  const handleMouseEnter = (segment, event) => {
    setHoveredIndex(segment.index);
    setTooltip(segment);
    updateTooltipPosition(event);
  };

  const handleMouseMove = (event) => {
    updateTooltipPosition(event);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip(null);
  };

  return (
    <>
      <div className="donut-wrap" ref={wrapRef} style={{ position: "relative" }}>
        <div className="donut">
          <svg
            viewBox="0 0 180 180"
            role="button"
            tabIndex={0}
            aria-label="Lihat semua kategori pengeluaran"
            style={{ width: 170, height: 170, overflow: "visible", cursor: "pointer" }}
            onClick={() => setOpen((isOpen) => !isOpen)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen((isOpen) => !isOpen);
              }
            }}
          >
            <path
              d={describeArc(center, center, ringRadius, 0, 359.999)}
              fill="none"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
            />

            {arcs.map((segment) => {
              const isHovered = hoveredIndex === segment.index;

              return (
                <path
                  key={`${segment.name}-${segment.index}`}
                  d={describeArc(
                    center,
                    center,
                    ringRadius,
                    segment.startAngle,
                    segment.endAngle,
                  )}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  transform={
                    isHovered
                      ? `translate(${segment.translateX} ${segment.translateY})`
                      : undefined
                  }
                  style={{
                    cursor: "pointer",
                    transition: "transform 200ms ease",
                  }}
                  onMouseEnter={(event) => handleMouseEnter(segment, event)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}

            <circle cx={center} cy={center} r="50" fill="var(--surface)" />

            <text
              x={center}
              y="85"
              textAnchor="middle"
              fill="var(--heading)"
              style={{
                fontSize: 13,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatCurrency(categoryTotal)}
            </text>
            <text
              x={center}
              y="105"
              textAnchor="middle"
              fill="var(--text-secondary)"
              style={{ fontSize: 10, fontWeight: 700 }}
            >
              Total Terpakai
            </text>
          </svg>
        </div>

        {tooltip && (
          <div
            className="donut-tooltip"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              pointerEvents: "none",
            }}
          >
            <span className="donut-tooltip-name">{tooltip.name}</span>
            <span className="donut-tooltip-value">
              {formatCurrency(tooltip.value)}
            </span>
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button
          className="category-legend-trigger"
          onClick={() => setOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span>
            {open ? "Sembunyikan Kategori" : `Lihat Kategori (${categories.length})`}
          </span>
        </button>

        {open && (
          <div className="category-legend-popover">
            {categories.map((category, index) => (
              <div key={`${category.name}-${index}`} className="category-legend-item">
                <i style={{ background: getColor(index) }} />
                <span className="category-legend-name">{category.name}</span>
                <span className="category-legend-pct">
                  {formatCurrency(category.value)} · {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
