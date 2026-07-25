import { useState, useEffect } from "react";

function Login({ onLogin }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("auth_theme") || "dark"
  );
  const [preload, setPreload] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = requestAnimationFrame(() => setPreload(false));
    return () => cancelAnimationFrame(t);
  }, []);

  // Ambil token dari URL (?token=...) setelah Google redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      params.delete("token");
      const clean = `${window.location.pathname}${
        params.toString() ? "?" + params.toString() : ""
      }`;
      window.history.replaceState({}, document.title, clean);
      onLogin(token);
      return;
    }
    const err = params.get("error");
    if (err) setTimeout(() => setError("Gagal masuk dengan Google. Coba lagi."), 0);
  }, [onLogin]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("auth_theme", next);
  };

  const handleGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const authCardClass = `auth-card theme-${theme}${
    preload ? " preload" : ""
  }`;

  return (
    <div className="login-page">
      <div className={authCardClass}>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Ganti tema"
          title={theme === "dark" ? "Mode terang" : "Mode gelap"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Panel kiri - login Google */}
        <section className="auth-left">
          <div className="auth-brand">
            <span className="auth-logo-dot" />
            <span className="logo">
              <span className="candy">Uangku</span>
            </span>
          </div>

          <div className="auth-left-body">
            <h1 className="auth-title">Masuk ke Akun</h1>
            <p className="auth-subtitle">
              Kelola keuangan pribadi dengan mudah dan terorganisir.
            </p>

            {error && <div className="login-error">{error}</div>}

            <button
              type="button"
              className="google-button"
              onClick={handleGoogle}
            >
              <span className="google-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="20" height="20">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </span>
              Masuk dengan Google
            </button>
          </div>

          <div className="auth-footer">
            <span>Pencatatan Keuangan &copy; 2026</span>
          </div>
        </section>

        {/* Panel kanan - penjelasan Uangku */}
        <aside className="auth-right">
          <div className="auth-right-inner">
            <h2 className="auth-right-title">Kelola uang, raih tenang.</h2>
            <p className="auth-right-desc">
              Uangku membantu kamu mencatat setiap rupiah, memantau saldo secara
              real-time, dan mencapai target tabungan dengan lebih disiplin.
            </p>
            <ul className="auth-features">
              <li>📊 Pantau saldo &amp; transaksi real-time</li>
              <li>🎯 Atur target tabungan &amp; anggaran</li>
              <li>🔒 Data keuangan aman di satu tempat</li>
            </ul>

            <div className="auth-illustration">
              <div className="auth-avatar">💰</div>
              <div className="float-card card-balance">
                <span className="fc-label">Saldo</span>
                <span className="fc-value">Rp 12.450.000</span>
              </div>
              <div className="float-card card-income">
                <span className="fc-label">Pemasukan</span>
                <span className="fc-value up">+ Rp 4.200.000</span>
              </div>
              <div className="float-card card-expense">
                <span className="fc-label">Pengeluaran</span>
                <span className="fc-value down">- Rp 1.800.000</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Login;
