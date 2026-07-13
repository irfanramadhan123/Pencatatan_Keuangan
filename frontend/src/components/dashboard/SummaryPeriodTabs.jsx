import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SummaryPeriodTabs({ periods, summaryPeriod, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = periods.find((p) => p.key === summaryPeriod) || periods[0];

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="summary-period-tabs">
      <span className="summary-period-label">Ringkasan</span>
      <div className="dropdown-wrapper" ref={ref}>
        <button className="dropdown-trigger" onClick={() => setOpen(!open)} type="button">
          {active.label}
          <ChevronDown size={14} strokeWidth={2.5} />
        </button>
        {open && (
          <div className="dropdown-menu">
            {periods.map((p) => (
              <button
                key={p.key}
                className={summaryPeriod === p.key ? "selected" : ""}
                onClick={() => { onChange(p.key); setOpen(false); }}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
