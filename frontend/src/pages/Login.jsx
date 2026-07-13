import { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetForm = () => {
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal! Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { username, email, password });
      setSuccess("Akun berhasil dibuat! Silakan masuk.");
      switchMode("login");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/forgot-password", { email, newPassword: password });
      setSuccess("Password berhasil direset! Silakan masuk.");
      switchMode("login");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mereset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <strong>Uangku</strong>
          </div>
          <h1>{mode === "login" ? "Masuk ke Akun" : mode === "register" ? "Buat Akun Baru" : "Reset Password"}</h1>
          <p>
            {mode === "login"
              ? "Kelola keuangan pribadi dengan mudah dan terorganisir."
              : mode === "register"
                ? "Daftar untuk mulai mencatat keuangan."
                : "Masukkan email dan password baru."}
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        {mode === "register" && (
          <form className="login-form" onSubmit={handleRegister}>
            <label>
              Nama
              <input type="text" placeholder="Nama lengkap" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <label>
              Konfirmasi Password
              <input type="password" placeholder="Ulangi password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </button>
            <button className="link-button back-link" type="button" onClick={() => switchMode("login")}>
              &larr; Kembali ke Login
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form className="login-form" onSubmit={handleForgot}>
            <label>
              Email
              <input type="email" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password Baru
              <input type="password" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <label>
              Konfirmasi Password Baru
              <input type="password" placeholder="Ulangi password baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Reset Password"}
            </button>
            <button className="link-button back-link" type="button" onClick={() => switchMode("login")}>
              &larr; Kembali ke Login
            </button>
          </form>
        )}

        {mode === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input type="email" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
            <div className="login-links">
              <button className="link-button" type="button" onClick={() => switchMode("register")}>
                Belum punya akun? <strong>Daftar</strong>
              </button>
              <button className="link-button" type="button" onClick={() => switchMode("forgot")}>
                Lupa password?
              </button>
            </div>
          </form>
        )}

        <div className="login-footer">
          <span>Pencatatan Keuangan &copy; 2026</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
