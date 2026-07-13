import { useEffect, useRef } from "react";
import { formatCurrency } from "../utils/format";

export function useAnimatedNumber(target) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = performance.now();
    const duration = 800;
    const from = 0;
    const to = Number(target || 0);
    let raf;
    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current.textContent = formatCurrency(from + (to - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return ref;
}
