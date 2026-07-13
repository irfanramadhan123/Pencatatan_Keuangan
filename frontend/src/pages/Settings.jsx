import { useEffect, useState } from "react";
import api from "../services/api";

const tabs = ["Profil", "Keamanan", "Notifikasi", "Tampilan"];

function Settings() {
  const [activeTab, setActiveTab] = useState("Profil");
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [initialProfile, setInitialProfile] = useState(profile);
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "IDR");
  const [timezone, setTimezone] = useState(() => localStorage.getItem("timezone") || "Asia/Jakarta");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let shouldUpdate = true;
    api.get("/auth/me")
      .then((response) => {
        if (!shouldUpdate) return;
        const nextProfile = { username: response.data.username || "", email: response.data.email || "" };
        setProfile(nextProfile);
        setInitialProfile(nextProfile);
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

  const handleCancel = () => {
    setProfile(initialProfile);
    setCurrency(localStorage.getItem("currency") || "IDR");
    setTimezone(localStorage.getItem("timezone") || "Asia/Jakarta");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put("/auth/me", profile);
      localStorage.setItem("currency", currency);
      localStorage.setItem("timezone", timezone);
      setInitialProfile({ username: response.data.user.username, email: response.data.user.email });
      setMessage("Profil berhasil disimpan.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Profil gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
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
            <button className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)} type="button">
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Profil" ? (
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
        ) : (
          <div className="empty-state tall">
            <strong>{activeTab} belum tersedia</strong>
            <span>Bagian ini akan dihubungkan setelah fitur profil utama selesai.</span>
          </div>
        )}
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
