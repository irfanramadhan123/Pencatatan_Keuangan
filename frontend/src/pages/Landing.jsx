import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRightLeft,
  FolderOpen,
  Wallet,
  PiggyBank,
  ChartNoAxesCombined,
  FileText,
  Settings,
  ShieldCheck,
  Activity,
  SlidersHorizontal,
  Target,
  FileCheck2,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import DashboardPreview from "../components/landing/DashboardPreview";
import desktopShot from "../assets/ssdahboarddekstop.png";
import mobileShot from "../assets/ssdashboardmobile.png";
import logo from "../assets/logo-uangku.png";

const navLinks = [
  { label: "Home", to: "/", href: null },
  { label: "Fitur", to: null, href: "#fitur" },
  { label: "Cara Kerja", to: null, href: "#cara-kerja" },
  { label: "FAQ", to: null, href: "#faq" },
];

const whys = [
  { icon: LayoutDashboard, text: "Semua data keuangan dalam satu dashboard" },
  { icon: Activity, text: "Pantau kondisi keuangan secara real-time" },
  { icon: SlidersHorizontal, text: "Kelola anggaran agar pengeluaran tetap terkendali" },
  { icon: Target, text: "Capai target tabungan dengan lebih mudah" },
  { icon: FileCheck2, text: "Laporan otomatis tanpa perhitungan manual" },
];

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    desc: "Ringkasan saldo, grafik cash flow, pengeluaran per kategori, transaksi terbaru, dan timeline aktivitas dalam satu layar.",
  },
  {
    icon: ArrowRightLeft,
    title: "Transaksi",
    desc: "Tambah, edit, hapus, pencarian, filter tipe, dan pagination untuk pemasukan serta pengeluaran.",
  },
  {
    icon: FolderOpen,
    title: "Kategori",
    desc: "Kelola kategori pemasukan dan pengeluaran lengkap dengan pantauan budget per kategori.",
  },
  {
    icon: Wallet,
    title: "Sumber Dana",
    desc: "Kelola rekening bank, e-wallet, maupun uang tunai untuk setiap transaksi.",
  },
  {
    icon: PiggyBank,
    title: "Target Tabungan",
    desc: "Atur target dan deadline tabungan, pantau progres, serta lihat riwayat penambahan dana.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Anggaran",
    desc: "Tetapkan batas pengeluaran per kategori tiap bulan dengan progress penggunaan yang jelas.",
  },
  {
    icon: FileText,
    title: "Laporan",
    desc: "Laporan bulanan, kuartalan, dan tahunan otomatis lengkap dengan export CSV.",
  },
  {
    icon: Settings,
    title: "Pengaturan",
    desc: "Kelola profil, tema gelap/terang, pilihan mata uang, zona waktu, dan notifikasi.",
  },
  {
    icon: ShieldCheck,
    title: "Login Aman",
    desc: "Masuk cepat dengan Google OAuth dan data keuangan Anda tersimpan aman.",
  },
];

const steps = [
  { title: "Login Google", desc: "Mulai dengan akun Google Anda." },
  { title: "Kategori & Sumber Dana", desc: "Siapkan kategori dan sumber dana." },
  { title: "Catat Transaksi", desc: "Catat pemasukan dan pengeluaran harian." },
  { title: "Atur Anggaran", desc: "Tetapkan batas pengeluaran bulanan." },
  { title: "Pantau Tabungan", desc: "Kejar target tabungan dengan deadline." },
  { title: "Lihat Laporan", desc: "Pahami keuangan dari laporan otomatis." },
];

const faqs = [
  {
    q: "Apakah Uangku gratis?",
    a: "Ya, Uangku gratis digunakan. Anda cukup login dengan akun Google untuk mulai mencatat keuangan.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Data keuangan Anda dilindungi dan hanya dapat diakses oleh akun Anda. Login menggunakan Google OAuth untuk keamanan berlapis.",
  },
  {
    q: "Apakah bisa digunakan di HP?",
    a: "Tentu. Uangku responsif dan nyaman digunakan di ponsel, tablet, maupun desktop.",
  },
  {
    q: "Apakah mendukung banyak rekening?",
    a: "Ya. Anda bisa menambahkan berbagai sumber dana seperti rekening bank, e-wallet, dan uang tunai.",
  },
  {
    q: "Apakah mendukung berbagai mata uang?",
    a: "Ya. Tersedia pilihan mata uang IDR, USD, dan MYR yang bisa disesuaikan di pengaturan.",
  },
];

function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function Reveal({ as: Tag = "div", children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`lp-reveal ${visible ? "in" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

function Navbar({ loggedIn }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const scrolled = useScrolled();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header className={`lp-nav${scrolled ? " scrolled" : ""}`}>
      <nav className="lp-nav-inner" aria-label="Navigasi utama">
        <Link to="/" className="lp-logo" onClick={() => setOpen(false)}>
          <img src={logo} alt="Uangku" className="lp-logo-img" />
          <strong>Uangku</strong>
        </Link>

        <ul className="lp-nav-links">
          {navLinks.map((link) =>
            link.href ? (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ) : (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            )
          )}
        </ul>

        <div className="lp-nav-actions">
          <button
            type="button"
            className="lp-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Mode terang" : "Mode gelap"}
            title={theme === "dark" ? "Mode terang" : "Mode gelap"}
          >
            {theme === "dark" ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
          </button>
          {loggedIn ? (
            <Link to="/dashboard" className="lp-btn lp-btn-primary">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="lp-btn lp-btn-primary">
              Login
            </Link>
          )}
          <button
            type="button"
            className="lp-hamburger"
            aria-label="Buka menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lp-mobile-menu">
          {navLinks.map((link) =>
            link.href ? (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            )
          )}
          {loggedIn ? (
            <Link to="/dashboard" className="lp-mobile-cta" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="lp-mobile-cta" onClick={() => setOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-bg" aria-hidden="true" />
      <div className="lp-container lp-hero-grid">
        <div className="lp-hero-copy">
          <span className="lp-badge">
            <Sparkles size={14} strokeWidth={2.5} />
            Pencatatan keuangan pribadi
          </span>
          <h1>
            Kelola Keuangan Pribadi <span className="lp-grad">Mudah, Aman, dan Terorganisir.</span>
          </h1>
          <p className="lp-hero-desc">
            Uangku membantu mencatat pemasukan dan pengeluaran, mengatur anggaran, memantau
            target tabungan, serta menyajikan laporan keuangan secara real-time dalam satu
            aplikasi.
          </p>
          <div className="lp-hero-actions">
            <Link to="/login" className="lp-btn lp-btn-primary lp-btn-lg">
              Mulai Gratis
            </Link>
            <a href="#fitur" className="lp-btn lp-btn-ghost lp-btn-lg">
              Lihat Fitur
            </a>
          </div>
          <p className="lp-hero-note">Gratis untuk semua · Login dengan Google</p>
        </div>

        <Reveal className="lp-hero-visual">
          <DashboardPreview src={desktopShot} />
        </Reveal>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="lp-why">
      <div className="lp-container lp-why-grid">
        <Reveal className="lp-why-copy">
          <span className="lp-eyebrow">Mengapa Memilih Uangku</span>
          <h2>Fokus pada keuangan Anda, bukan perhitungannya</h2>
          <p>
            Uangku dirancang agar pengelolaan keuangan terasa ringan, terarah, dan memberi
            ketenangan tanpa perlu repot menghitung manual.
          </p>
        </Reveal>
        <ul className="lp-why-list">
          {whys.map((item, i) => (
            <Reveal as="li" key={item.text} delay={i * 70}>
              <span className="lp-why-icon">
                <item.icon size={18} strokeWidth={2.2} />
              </span>
              {item.text}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="lp-features" id="fitur">
      <div className="lp-container">
        <Reveal className="lp-section-head center">
          <span className="lp-eyebrow">Fitur</span>
          <h2>Semua yang Anda butuhkan untuk mengelola uang</h2>
          <p>Fitur lengkap yang benar-benar tersedia di Uangku.</p>
        </Reveal>
        <div className="lp-features-grid">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 80}>
              <article className="lp-feature-card">
                <div className="lp-feature-icon">
                  <feature.icon size={22} strokeWidth={2} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewSection() {
  return (
    <section className="lp-preview" id="preview">
      <div className="lp-container">
        <Reveal className="lp-section-head center">
          <span className="lp-eyebrow">Preview Dashboard</span>
          <h2>Semua dalam satu dashboard</h2>
          <p>
            Semua informasi keuangan Anda dapat dipantau dalam satu dashboard yang sederhana
            dan mudah dipahami.
          </p>
        </Reveal>
        <div className="lp-preview-grid">
          <Reveal>
            <DashboardPreview src={desktopShot} />
          </Reveal>
          <Reveal delay={120}>
            <DashboardPreview src={mobileShot} phone />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section className="lp-how" id="cara-kerja">
      <div className="lp-container">
        <Reveal className="lp-section-head center">
          <span className="lp-eyebrow">Cara Kerja</span>
          <h2>Mulai dalam beberapa langkah</h2>
          <p>Ikuti alur sederhana ini dan keuangan Anda langsung terkendali.</p>
        </Reveal>
        <ol className="lp-steps">
          {steps.map((step, i) => (
            <Reveal as="li" className="lp-step" key={step.title} delay={i * 70}>
              <span className="lp-step-num">{i + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={`lp-faq-item${open ? " open" : ""}`}>
      <button
        type="button"
        className="lp-faq-question"
        aria-expanded={open}
        aria-controls={`faq-panel-${id}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{q}</span>
        <ChevronDown size={18} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <div className="lp-faq-answer" id={`faq-panel-${id}`} role="region">
        <div className="lp-faq-answer-inner">
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  return (
    <section className="lp-faq" id="faq">
      <div className="lp-container">
        <Reveal className="lp-section-head center">
          <span className="lp-eyebrow">FAQ</span>
          <h2>Pertanyaan yang sering diajukan</h2>
        </Reveal>
        <div className="lp-faq-list">
          {faqs.map((item) => (
            <Reveal key={item.q}>
              <FaqItem q={item.q} a={item.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="lp-cta">
      <div className="lp-container">
        <Reveal>
          <div className="lp-cta-inner">
            <h2>Siap Mengelola Keuangan dengan Lebih Baik?</h2>
            <p>
              Mulailah mencatat transaksi, mengatur anggaran, dan mencapai target keuangan
              Anda bersama Uangku.
            </p>
            <Link to="/login" className="lp-btn lp-btn-cta lp-btn-lg">
              Mulai Gratis
            </Link>
            <small>Tidak perlu kartu kredit · Login dengan Google · Gratis digunakan</small>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-inner">
           <div className="lp-footer-brand">
            <Link to="/" className="lp-logo">
              <img src={logo} alt="Uangku" className="lp-logo-img" />
              <strong>Uangku</strong>
            </Link>
            <p>
              Kelola keuangan pribadi dengan lebih mudah, aman, dan terorganisir dalam satu
              aplikasi.
            </p>
          </div>

          <div>
            <h4>Menu</h4>
            <nav className="lp-footer-links" aria-label="Tautan footer">
              <Link to="/">Home</Link>
              <a href="#fitur">Fitur</a>
              <a href="#cara-kerja">Cara Kerja</a>
              <a href="#faq">FAQ</a>
              <Link to="/login">Login</Link>
            </nav>
          </div>

          <div>
            <h4>Lainnya</h4>
            <nav className="lp-footer-links" aria-label="Tautan legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
              <a
                href="https://github.com/irfanramadhan123/Pencatatan_Keuangan"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>
            </nav>
          </div>
        </div>
        <p className="lp-footer-copy">© 2026 Uangku. All rights reserved.</p>
      </div>
    </footer>
  );
}

function Landing({ loggedIn }) {
  return (
    <div className="lp-page">
      <Navbar loggedIn={loggedIn} />
      <main>
        <Hero />
        <WhySection />
        <FeaturesSection />
        <PreviewSection />
        <HowSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

export default Landing;
