import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={setToken} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/kategori" element={<Categories />} />
                  <Route path="/laporan" element={<Reports />} />
                  <Route path="/pengaturan" element={<Settings />} />
                  <Route path="/transaksi" element={<div className="empty-state tall" style={{marginTop: '72px'}}><strong>Halaman Transaksi</strong><span>Segera hadir.</span></div>} />
                  <Route path="/sumber-dana" element={<div className="empty-state tall" style={{marginTop: '72px'}}><strong>Halaman Sumber Dana</strong><span>Segera hadir.</span></div>} />
                  <Route path="/tabungan" element={<div className="empty-state tall" style={{marginTop: '72px'}}><strong>Halaman Tabungan</strong><span>Segera hadir.</span></div>} />
                  <Route path="/anggaran" element={<div className="empty-state tall" style={{marginTop: '72px'}}><strong>Halaman Anggaran</strong><span>Segera hadir.</span></div>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
