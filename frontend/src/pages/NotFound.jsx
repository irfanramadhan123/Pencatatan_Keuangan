import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

function NotFound() {
  return (
    <main className="lp-page lp-notfound">
      <div className="lp-notfound-inner">
        <span className="lp-notfound-icon" aria-hidden="true">
          <Compass size={28} strokeWidth={2} />
        </span>
        <p className="lp-notfound-code">404</p>
        <h1>Halaman tidak ditemukan</h1>
        <p className="lp-notfound-desc">
          Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
        </p>
        <Link to="/" className="lp-btn lp-btn-primary lp-btn-lg">
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
