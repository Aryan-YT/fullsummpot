import { useNavigate, useLocation, Link } from "react-router-dom";
import { getUserData } from "../utils/auth";
import { useState, useEffect, useCallback } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch(`http://localhost:5242/api/Links/supporters/${user.UserID}`);
      if (r.ok) {
        const supporters = await r.json();
        const lastSeen = parseInt(localStorage.getItem("notifLastSeen") || "0");
        setUnreadCount(supporters.filter(s => new Date(s.createdAt).getTime() > lastSeen).length);
      }
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const handler = () => setUnreadCount(0);
    window.addEventListener("notifRead", handler);
    return () => window.removeEventListener("notifRead", handler);
  }, [fetchUnread]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Home", icon: "🏠" },
    { to: "/communities", label: "Communities", icon: "👥" },
    { to: "/my-links", label: "My Links", icon: "🔗" },
    { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    ...(user && user.role === "Admin" ? [{ to: "/admin", label: "Admin", icon: "🛡️" }] : []),
  ];

  const isActive = (p) => location.pathname === p || (p !== "/dashboard" && location.pathname.startsWith(p));

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 60,
      background: scrolled ? "rgba(5,5,7,0.92)" : "rgba(10,10,15,0.75)",
      backdropFilter: "blur(16px) saturate(1.6)",
      borderBottom: `1px solid ${scrolled ? "var(--border-hover)" : "var(--border)"}`,
      transition: "all 0.35s",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <img src="/logo.png" alt="Logo" style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", transition: "all 0.4s" }} className="logo-glow" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
            <span style={{ color: "var(--accent)" }}>Full</span>
            <span style={{ color: "var(--text-primary)" }}> Summpot</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }} className="desktop-only">
          {navItems.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "var(--radius-sm)",
              fontSize: "0.84rem", fontWeight: 500, transition: "all 0.25s",
              background: isActive(to) ? "rgba(220,38,38,0.1)" : "transparent",
              color: isActive(to) ? "var(--accent-hover)" : "var(--text-secondary)",
              border: isActive(to) ? "1px solid rgba(220,38,38,0.15)" : "1px solid transparent",
            }}>
              <span style={{ fontSize: "0.88rem" }}>{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {user && (
            <Link to="/notifications" style={{ position: "relative", padding: "8px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", transition: "all 0.25s" }}>
              <span style={{ fontSize: "1.1rem" }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: "3px", right: "3px", width: "16px", height: "16px", borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: "0.6rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 8px var(--accent-glow)" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <>
              <Link to="/settings" className="btn-ghost btn-icon desktop-only" title="Settings" style={{ fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)" }}>⚙️</Link>
              <Link to={`/profile/${user.UserID}`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px", borderRadius: "var(--radius-sm)", transition: "all 0.25s" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--accent-subtle)", border: "1px solid rgba(220,38,38,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-hover)" }}>
                  {user.Username?.charAt(0).toUpperCase()}
                </div>
                <span className="desktop-only" style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--text-primary)" }}>{user.Username}</span>
              </Link>
              <button onClick={logout} className="btn-ghost btn-sm desktop-only" style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Logout</button>
            </>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => navigate("/login")} className="btn btn-secondary btn-sm">Sign In</button>
              <button onClick={() => navigate("/register")} className="btn btn-primary btn-sm">Register</button>
            </div>
          )}

          <button className="mobile-only" onClick={() => setMobileOpen(!mobileOpen)} style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px", animation: "slideUp 0.2s ease-out" }}>
          {navItems.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", fontWeight: 500,
              background: isActive(to) ? "var(--accent-subtle)" : "transparent",
              color: isActive(to) ? "var(--accent-hover)" : "var(--text-secondary)",
            }}>
              <span>{icon}</span>{label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/settings" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                <span>⚙️</span>Settings
              </Link>
              <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", fontWeight: 500, color: "var(--text-muted)", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%" }}>
                🚪 Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}