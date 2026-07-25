import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import api from "./services/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import FundSources from "./pages/FundSources";
import Savings from "./pages/Savings";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [authChecked, setAuthChecked] = useState(() => !localStorage.getItem("token"));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    api
      .get("/auth/me")
      .then(() => setTimeout(() => setAuthChecked(true), 0))
      .catch(() => {
        localStorage.removeItem("token");
        setTimeout(() => {
          setToken(null);
          setAuthChecked(true);
        }, 0);
      });
  }, []);

  if (!authChecked) {
    return null;
  }

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
                  <Route path="/transaksi" element={<Transactions />} />
                  <Route path="/kategori" element={<Categories />} />
                  <Route path="/sumber-dana" element={<FundSources />} />
                  <Route path="/tabungan" element={<Savings />} />
                  <Route path="/anggaran" element={<Budgets />} />
                  <Route path="/laporan" element={<Reports />} />
                  <Route path="/pengaturan" element={<Settings />} />
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
