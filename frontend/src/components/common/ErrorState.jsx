export default function ErrorState({ message, onRetry }) {
  return (
    <>
      <section className="welcome">
        <div>
          <h1>Dashboard Keuangan</h1>
          <p>Pantau saldo, pemasukan, pengeluaran, dan transaksi terbaru.</p>
        </div>
      </section>
      <div className="error-state">
        <div className="error-state-icon">⚠️</div>
        <strong>{message}</strong>
        <span>Pastikan koneksi internet stabil dan server berjalan.</span>
        <button className="retry-button" onClick={onRetry} type="button">
          <span className="retry-icon" />Coba Lagi
        </button>
      </div>
    </>
  );
}
