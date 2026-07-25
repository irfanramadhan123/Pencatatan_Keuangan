import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getCurrencyPreference, setCurrencyPreference } from "../utils/format";

const tabs = ["Profil", "Notifikasi", "Tampilan"];

function Settings() {
  const [activeTab, setActiveTab] = useState("Profil");
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [initialProfile, setInitialProfile] = useState(profile);
  const [currency, setCurrency] = useState(() => getCurrencyPreference());
  const [timezone, setTimezone] = useState(() => localStorage.getItem("timezone") || "Asia/Jakarta");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem("notifPrefs");
    return saved ? JSON.parse(saved) : { emailTransaksi: true, emailAnggaran: true, emailTabungan: false, pushTransaksi: true, pushAnggaran: false, pushTabungan: true };
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    let shouldUpdate = true;
    api.get("/auth/me")
      .then((response) => {
        if (!shouldUpdate) return;
        const nextProfile = {
          username: response.data.username || "",
          email: response.data.email || "",
          savings_target: response.data.savings_target || 0,
          currency: response.data.currency || "IDR",
          timezone: response.data.timezone || "Asia/Jakarta",
        };
        setProfile(nextProfile);
        setInitialProfile(nextProfile);
        setCurrency(nextProfile.currency);
        setCurrencyPreference(nextProfile.currency);
        setTimezone(nextProfile.timezone);
        localStorage.setItem("timezone", nextProfile.timezone);
        setMessage("");
      })
      .catch(() => {
        if (!shouldUpdate) return;
        setMessage("Profil belum bisa dimuat. Pastikan backend berjalan dan akun sudah login.");
      });
    return () => { shouldUpdate = false; };
  }, []);

  const initials = (profile.username || profile.email || "U").slice(0, 2).toUpperCase();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const navigate = useNavigate();

  const handleCancel = () => {
    setProfile(initialProfile);
    setCurrency(getCurrencyPreference());
    setTimezone(localStorage.getItem("timezone") || "Asia/Jakarta");
    setMessage("");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Yakin ingin menghapus akun? Semua data (transaksi, kategori, tabungan) akan hilang permanen. Tindakan ini tidak bisa dibatalkan.")) return;
    if (!window.confirm("Konfirmasi ulang: Hapus akun ini?")) return;
    try {
      await api.delete("/auth/me");
      localStorage.removeItem("token");
      navigate("/login");
      window.location.reload();
    } catch {
      setMessage("Gagal menghapus akun.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put("/auth/me", {
        username: profile.username,
        email: profile.email,
        currency,
        timezone,
      });
      setCurrencyPreference(currency);
      localStorage.setItem("timezone", timezone);
      setInitialProfile({ ...response.data.user });
      setMessage("Profil berhasil disimpan.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Profil gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotifChange = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem("notifPrefs", JSON.stringify(updated));
    setMessage("Preferensi notifikasi disimpan.");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setMessage("Tampilan berhasil diubah.");
    setTimeout(() => setMessage(""), 2000);
  };

  const renderTab = () => {
    if (activeTab === "Profil") {
      return (
        <>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-picture-row">
            <div className="profile-picture">{initials}</div>
            <div>
              <h2>Foto Profil</h2>
              <p>Gunakan inisial akun untuk saat ini. Upload foto bisa ditambahkan nanti.</p>
              <div className="profile-picture-actions">
                <button type="button">Ubah</button>
                <button className="text-danger" type="button">Hapus</button>
              </div>
            </div>
          </div>

          <div className="settings-fields">
            <label>
              Nama
              <input name="username" onChange={handleChange} value={profile.username} />
            </label>
            <label>
              Username
              <input readOnly value={(profile.username || "pengguna").toLowerCase().replaceAll(" ", "_")} />
            </label>
            <label className="span-2">
              Email
              <input name="email" onChange={handleChange} type="email" value={profile.email} />
              <span className="verified-label">Terverifikasi</span>
            </label>
            <label>
              Mata Uang Utama
              <select onChange={(e) => setCurrency(e.target.value)} value={currency}>
                <option value="IDR">IDR - Rupiah Indonesia</option>
                <option value="USD">USD - US Dollar</option>
                <option value="MYR">MYR - Ringgit Malaysia</option>
              </select>
            </label>
            <label>
              Zona Waktu
              <select onChange={(e) => setTimezone(e.target.value)} value={timezone}>
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </label>
          </div>

          <div className="settings-actions">
            <button className="secondary-action" onClick={handleCancel} type="button">Batal</button>
            <button className="primary-action" disabled={isSaving} type="submit">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
        <div className="danger-zone">
          <h3>Zona Berbahaya</h3>
          <p>Setelah menghapus akun, semua data tidak bisa dikembalikan.</p>
          <button className="secondary-action" onClick={handleDeleteAccount} type="button" style={{ color: "#ef4444", borderColor: "#ef4444" }}>
            Hapus Akun
          </button>
        </div>
        </>
      );
    }

    if (activeTab === "Notifikasi") {
      const notifItems = [
        { key: "emailTransaksi", label: "Email - Transaksi baru", desc: "Dapatkan email setiap kali ada transaksi baru." },
        { key: "emailAnggaran", label: "Email - Peringatan anggaran", desc: "Notifikasi saat anggaran hampir habis." },
        { key: "emailTabungan", label: "Email - Progres tabungan", desc: "Update berkala tentang progres tabungan." },
        { key: "pushTransaksi", label: "Push - Transaksi baru", desc: "Notifikasi push untuk setiap transaksi." },
        { key: "pushAnggaran", label: "Push - Peringatan anggaran", desc: "Peringatan saat anggaran melebihi batas." },
        { key: "pushTabungan", label: "Push - Progres tabungan", desc: "Pengingat untuk menabung." },
      ];
      return (
        <div className="profile-form">
          <div className="settings-fields" style={{ gridTemplateColumns: "1fr" }}>
            {notifItems.map((item) => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                <div>
                  <strong style={{ color: "var(--heading)", fontSize: 14, display: "block" }}>{item.label}</strong>
                  <span style={{ color: "var(--text-light)", fontSize: 12 }}>{item.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifChange(item.key)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 999,
                    border: 0,
                    cursor: "pointer",
                    background: notifPrefs[item.key] ? "var(--blue-600)" : "var(--blue-100)",
                    position: "relative",
                    transition: "all var(--transition)",
                  }}
                  aria-label={item.label}
                >
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: notifPrefs[item.key] ? 23 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ffffff",
                    transition: "all var(--transition)",
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "Tampilan") {
      return (
        <div className="profile-form">
          <div className="settings-fields" style={{ gridTemplateColumns: "1fr" }}>
            <label style={{ gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)" }}>Tema Tampilan</span>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  style={{
                    flex: 1,
                    minHeight: 80,
                    padding: 16,
                    borderRadius: "var(--radius)",
                    border: theme === "dark" ? "2px solid var(--blue-600)" : "2px solid var(--line)",
                    background: theme === "dark" ? "var(--blue-50)" : "transparent",
                    cursor: "pointer",
                    transition: "all var(--transition)",
                    textAlign: "left",
                  }}
                >
                  <strong style={{ color: "var(--heading)", fontSize: 14, display: "block" }}>Gelap</strong>
                  <span style={{ color: "var(--text-light)", fontSize: 12 }}>Tampilan gelap untuk kenyamanan mata.</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  style={{
                    flex: 1,
                    minHeight: 80,
                    padding: 16,
                    borderRadius: "var(--radius)",
                    border: theme === "light" ? "2px solid var(--blue-600)" : "2px solid var(--line)",
                    background: theme === "light" ? "var(--blue-50)" : "transparent",
                    cursor: "pointer",
                    transition: "all var(--transition)",
                    textAlign: "left",
                  }}
                >
                  <strong style={{ color: "var(--heading)", fontSize: 14, display: "block" }}>Terang</strong>
                  <span style={{ color: "var(--text-light)", fontSize: 12 }}>Tampilan terang untuk siang hari.</span>
                </button>
              </div>
            </label>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <section className="settings-hero">
        <div>
          <h1>Pengaturan Akun</h1>
          <p>Kelola profil, keamanan, dan preferensi aplikasi.</p>
        </div>
      </section>

      {message && <p className="notice">{message}</p>}

      <section className="settings-card">
        <div className="settings-tabs" aria-label="Tab pengaturan">
          {tabs.map((tab) => (
            <button className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => { setActiveTab(tab); setMessage(""); }} type="button">
              {tab}
            </button>
          ))}
        </div>

        {renderTab()}
      </section>

      <section className="settings-shortcuts">
        <article>
          <i className="shield-icon" />
          <strong>Kebijakan Privasi</strong>
          <span>Lihat bagaimana data akun dikelola.</span>
        </article>
        <article>
          <i className="support-icon" />
          <strong>Bantuan</strong>
          <span>Dapatkan bantuan untuk akun dan transaksi.</span>
        </article>
        <article>
          <i className="audit-icon" />
          <strong>Aktivitas Akun</strong>
          <span>Riwayat perubahan profil akan tampil di sini.</span>
        </article>
      </section>
    </>
  );
}

export default Settings;
