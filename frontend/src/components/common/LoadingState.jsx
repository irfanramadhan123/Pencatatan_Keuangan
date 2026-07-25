export default function LoadingState() {
  return (
    <>
      <section className="welcome">
        <div>
          <h1>Dashboard Keuangan</h1>
          <p>Memuat data keuangan...</p>
        </div>
      </section>
      <section className="summary-grid" aria-label="Memuat ringkasan">
        {[1, 2, 3, 4].map((i) => (
          <article className="metric-card skeleton-card" key={i}>
            <div className="skeleton-line skeleton-sm" />
            <div className="skeleton-line skeleton-md" style={{ marginTop: 24 }} />
            <div className="skeleton-line skeleton-lg" style={{ marginTop: 8 }} />
            <div className="skeleton-line skeleton-chart" style={{ marginTop: 14 }} />
          </article>
        ))}
      </section>
      <section className="content-grid">
        <article className="panel wide skeleton-card">
          <div className="skeleton-line skeleton-md" />
          <div className="skeleton-line skeleton-chart-full" style={{ marginTop: 20 }} />
        </article>
        <article className="panel skeleton-card">
          <div className="skeleton-line skeleton-md" />
          <div className="skeleton-circle" style={{ marginTop: 20 }} />
        </article>
        <article className="panel wide skeleton-card">
          <div className="skeleton-line skeleton-md" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton-line"
              style={{ height: 44, marginTop: i === 1 ? 20 : 12, borderRadius: 8 }}
            />
          ))}
        </article>
        <article className="panel skeleton-card">
          <div className="skeleton-line skeleton-md" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-line"
              style={{ height: 38, marginTop: i === 1 ? 20 : 12, borderRadius: 8 }}
            />
          ))}
        </article>
      </section>
    </>
  );
}
