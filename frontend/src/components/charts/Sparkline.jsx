export default function Sparkline({ values, tone }) {
  if (values.length < 2) return <div className="mini-empty">Belum ada grafik</div>;
  const maxValue = Math.max(...values, 1);
  const w = 110, h = 42;
  const gap = w / (values.length - 1);
  const path = values.map((v, i) => {
    const x = i * gap;
    const y = h - (v / maxValue) * h;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg className={`sparkline ${tone}`} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`grad-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${tone})`} opacity="0.5" />
      <path d={path} stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = i * gap;
        const y = h - (v / maxValue) * h;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="white" stroke="currentColor" strokeWidth="1.5" opacity="0" className="sparkline-dot" />;
      })}
    </svg>
  );
}
