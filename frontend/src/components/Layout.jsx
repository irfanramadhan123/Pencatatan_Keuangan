import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { LayoutDashboard, ArrowRightLeft, FolderOpen, Wallet, PiggyBank, ChartNoAxesCombined, FileText, Settings, User, CircleHelp, LogOut, X, Menu, Sun, Moon } from "lucide-react";
import { formatCurrency } from "../utils/format";
import logo from "../assets/logo-uangku.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Transaksi", icon: ArrowRightLeft, path: "/transaksi" },
  { label: "Kategori", icon: FolderOpen, path: "/kategori" },
  { label: "Sumber Dana", icon: Wallet, path: "/sumber-dana" },
  { label: "Tabungan", icon: PiggyBank, path: "/tabungan" },
  { label: "Anggaran", icon: ChartNoAxesCombined, path: "/anggaran" },
  { label: "Laporan", icon: FileText, path: "/laporan" },
  { label: "Pengaturan", icon: Settings, path: "/pengaturan" },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ transactions: [], categories: [], savings: [], budgets: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const profileRef = useRef(null);
  const searchTimeout = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        setProfile({ username: res.data.username || "", email: res.data.email || "" });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Debounced search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults({ transactions: [], categories: [], savings: [], budgets: [] });
      setShowSearch(false);
      return;
    }
    setShowSearch(true);
    setSearchLoading(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const [txRes, catRes, svRes, bgRes] = await Promise.all([
          api.get("/transactions?limit=99999"),
          api.get("/categories"),
          api.get("/savings"),
          api.get("/budgets"),
        ]);
        const q = query.toLowerCase();
        const txData = txRes.data;
        const txList = Array.isArray(txData) ? txData : (txData.data || []);
        const filteredTx = txList.filter(
          (t) =>
            (t.description || "").toLowerCase().includes(q) ||
            (t.category_name || "").toLowerCase().includes(q)
        ).slice(0, 5);
        const filteredCat = (catRes.data || []).filter(
          (c) => (c.name || "").toLowerCase().includes(q)
        ).slice(0, 3);
        const filteredSv = (svRes.data || []).filter(
          (s) => (s.name || "").toLowerCase().includes(q)
        ).slice(0, 3);
        const filteredBg = (bgRes.data || []).filter(
          (b) => (b.category_name || "").toLowerCase().includes(q)
        ).slice(0, 3);
        setSearchResults({ transactions: filteredTx, categories: filteredCat, savings: filteredSv, budgets: filteredBg });
      } catch {
        setSearchResults({ transactions: [], categories: [], savings: [], budgets: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, []);

  const initials = (profile.username || profile.email || "U").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="finance-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img src={logo} alt="Uangku" className="sidebar-logo" />
            <div className="brand-text">
              <strong>Uangku</strong>
              <small>Pencatatan Keuangan</small>
            </div>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} type="button" aria-label="Tutup menu">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? "active" : "")}
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{profile.username || "Pengguna"}</strong>
            <span>Akun aktif</span>
          </div>
        </div>

        <button className="upgrade-button" onClick={handleLogout} type="button">
          Keluar
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} type="button" aria-label="Buka menu">
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <Link to="/dashboard" className="topbar-brand">
              <strong>Uangku</strong>
            </Link>
          </div>

          <label className="search-box" ref={searchBoxRef}>
            <span className="search-icon" />
            <input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setShowSearch(true); }}
            />
            {showSearch && (
              <div className="search-dropdown">
                {searchLoading ? (
                  <div className="search-dropdown-empty">Mencari...</div>
                ) : searchResults.transactions.length === 0 && searchResults.categories.length === 0 && searchResults.savings.length === 0 && searchResults.budgets.length === 0 ? (
                  <div className="search-dropdown-empty">Tidak ditemukan hasil untuk "{searchQuery}"</div>
                ) : (
                  <>
                    {searchResults.transactions.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-section-title">Transaksi</div>
                        {searchResults.transactions.map((t) => (
                          <button
                            key={t.id}
                            className="search-result-item"
                            onClick={() => { setShowSearch(false); setSearchQuery(""); navigate("/transaksi"); }}
                            type="button"
                          >
                            <mark className={t.type === "pemasukan" ? "income" : "expense"}>{t.category_name || "Umum"}</mark>
                            {t.description || "Transaksi"}
                            <span className={`search-result-amount ${t.type === "pemasukan" ? "positive" : "negative"}`}>
                              {t.type === "pemasukan" ? "+" : "-"}{formatCurrency(t.amount)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.categories.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-section-title">Kategori</div>
                        {searchResults.categories.map((c) => (
                          <button
                            key={c.id}
                            className="search-result-item"
                            onClick={() => { setShowSearch(false); setSearchQuery(""); navigate("/kategori"); }}
                            type="button"
                          >
                            {c.name}
                            <mark className="income">{c.type || "umum"}</mark>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.savings.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-section-title">Tabungan</div>
                        {searchResults.savings.map((s) => (
                          <button
                            key={s.id}
                            className="search-result-item"
                            onClick={() => { setShowSearch(false); setSearchQuery(""); navigate("/tabungan"); }}
                            type="button"
                          >
                            {s.name}
                            <span className="search-result-amount positive">{formatCurrency(s.target_amount)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.budgets.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-section-title">Anggaran</div>
                        {searchResults.budgets.map((b) => (
                          <button
                            key={b.id}
                            className="search-result-item"
                            onClick={() => { setShowSearch(false); setSearchQuery(""); navigate("/anggaran"); }}
                            type="button"
                          >
                            {b.category_name}
                            <mark className="income">{b.period}</mark>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </label>

          <div className="top-actions">
            <button aria-label="Bantuan">
              <CircleHelp size={16} strokeWidth={2.5} />
            </button>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} type="button" aria-label="Toggle tema">
              {darkMode ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
            </button>
            <div className="user-divider" />
            <div className="profile-dropdown" ref={profileRef}>
              <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} type="button">
                <strong>{profile.username || "Pengguna"}</strong>
                <div className="mini-avatar">{initials}</div>
              </button>
              {profileOpen && (
                <div className="dropdown-menu" style={{ right: 0, minWidth: 190 }}>
                  <button onClick={() => { navigate("/pengaturan"); setProfileOpen(false); }} type="button">
                    <User size={15} strokeWidth={2} />
                    Profil Saya
                  </button>
                  <button onClick={() => { navigate("/pengaturan"); setProfileOpen(false); }} type="button">
                    <Settings size={15} strokeWidth={2} />
                    Pengaturan Akun
                  </button>
                  <button onClick={() => setProfileOpen(false)} type="button">
                    <CircleHelp size={15} strokeWidth={2} />
                    Bantuan
                  </button>
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} type="button" className="dropdown-logout">
                    <LogOut size={15} strokeWidth={2} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default Layout;
