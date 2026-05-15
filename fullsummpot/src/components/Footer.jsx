import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", marginBottom: "32px" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <img src="/logo.png" alt="Full Summpot" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} className="logo-glow" />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
                <span style={{ color: "var(--accent)" }}>Full</span> Summpot
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6, maxWidth: "280px" }}>
              The ultimate creator support platform. Grow your channel through community-powered cross-promotion.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "12px", color: "var(--text-primary)" }}>Platform</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link to="/communities" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>Communities</Link>
              <Link to="/leaderboard" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>Leaderboard</Link>
              <Link to="/my-links" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>My Links</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "12px", color: "var(--text-primary)" }}>Legal</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link to="/terms" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>Terms of Service</Link>
              <Link to="/terms#privacy" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>Privacy Policy</Link>
              <Link to="/terms#guidelines" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>Community Guidelines</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "12px", color: "var(--text-primary)" }}>Account</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link to="/settings" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>Settings</Link>
              <Link to="/notifications" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", transition: "color 0.2s" }}>Notifications</Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />

        {/* Bottom */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: 0 }}>
            © {new Date().getFullYear()} Full Summpot. All rights reserved.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: 0 }}>
            Built with ❤️ for creators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
