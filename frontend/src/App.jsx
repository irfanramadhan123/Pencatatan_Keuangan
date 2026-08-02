import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import api from "./services/api";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
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

  const appPage = (element) => (
    <ProtectedRoute>
      <Layout>{element}</Layout>
    </ProtectedRoute>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing loggedIn={!!token} />} />
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={setToken} />
            )
          }
        />
        <Route path="/dashboard" element={appPage(<Dashboard />)} />
        <Route path="/transaksi" element={appPage(<Transactions />)} />
        <Route path="/kategori" element={appPage(<Categories />)} />
        <Route path="/sumber-dana" element={appPage(<FundSources />)} />
        <Route path="/tabungan" element={appPage(<Savings />)} />
        <Route path="/anggaran" element={appPage(<Budgets />)} />
        <Route path="/laporan" element={appPage(<Reports />)} />
        <Route path="/pengaturan" element={appPage(<Settings />)} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
