function DashboardPreview({ src, alt = "Preview dashboard Uangku", phone = false }) {
  return (
    <div className={`lp-frame${phone ? " lp-frame-phone" : ""}`}>
      {!phone && (
        <div className="lp-frame-bar">
          <span className="lp-frame-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="lp-frame-url">app.uangku.dev/dashboard</span>
        </div>
      )}
      <div className="lp-frame-body">
        {src ? (
          <img src={src} alt={alt} loading="lazy" />
        ) : (
          <div className="lp-ph" aria-hidden="true">
            <span className="lp-ph-mark" />
            <strong>Screenshot Dashboard</strong>
            <small>Ganti dengan screenshot asli</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPreview;
