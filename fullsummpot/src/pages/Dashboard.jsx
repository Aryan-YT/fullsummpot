import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUserData();
  const [communities, setCommunities] = useState([]);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
  }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const [commRes, ptsRes] = await Promise.all([
        API.get(`/Communities?userID=${user.UserID}`),
        API.get(`/Links/points/${user.UserID}`),
      ]);
      setCommunities(commRes.data);
      setPoints(ptsRes.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const joined = communities.filter((c) => c.isMember);
  const suggested = communities.filter((c) => !c.isMember).slice(0, 6);

  if (!user) return null;

  const stats = [
    { label: "Available Points", value: points?.availablePoints ?? 0, icon: "⭐", gradient: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.02))", borderColor: "rgba(251,191,36,0.15)" },
    { label: "Earned Today", value: points?.pointsEarnedToday ?? 0, icon: "⚡", gradient: "linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.02))", borderColor: "rgba(220,38,38,0.15)" },
    { label: "Views Given", value: points?.viewsGivenToday ?? 0, icon: "▶", gradient: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.02))", borderColor: "rgba(34,197,94,0.15)" },
    { label: "My Communities", value: joined.length, icon: "👥", gradient: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.02))", borderColor: "rgba(59,130,246,0.15)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        {/* Hero */}
        <div className="hero-section" style={{ marginBottom: "28px", position: "relative" }}>
          <div className="orb" style={{ width: "300px", height: "300px", background: "rgba(220,38,38,0.05)", top: "-80px", right: "-60px" }} />
          <div className="orb" style={{ width: "200px", height: "200px", background: "rgba(59,130,246,0.03)", bottom: "-60px", left: "-40px" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div className="animate-float" style={{ flexShrink: 0 }}>
              <img src="/logo.png" alt="Logo" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }} className="logo-glow" />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
                Hey, <span className="text-gradient">{user.Username}</span> 👋
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0 }}>
                Ready to grow? Here's your daily overview.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "32px" }}>
          {stats.map((stat, i) => (
            <div key={stat.label} className="card stat-card card-3d" style={{ background: stat.gradient, borderColor: stat.borderColor, display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="card-3d-inner" style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 1px", letterSpacing: "-0.02em" }}>{stat.value}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
          <Link to="/communities" className="btn btn-outline">👥 Browse Communities</Link>
          <Link to="/leaderboard" className="btn btn-outline">🏆 Leaderboard</Link>
          <Link to="/my-links" className="btn btn-outline">🔗 My Links</Link>
        </div>

        {/* My Communities */}
        {joined.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <div className="section-header">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>👥 My Communities</h3>
              <Link to="/communities" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>View all →</Link>
            </div>
            <div className="grid-auto">
              {joined.slice(0, 6).map((c, i) => (
                <Link key={c.communityID} to={`/community/${c.communityID}`} className="card" style={{ textDecoration: "none", display: "block", animationDelay: `${i * 0.05}s` }}>
                  {c.bannerUrl && (
                    <div style={{ width: "100%", height: "100px", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: "12px" }}>
                      <img src={c.bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span className="badge badge-accent">{c.niche || "General"}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>👥 {c.memberCount}</span>
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: "0.95rem", margin: "0 0 4px" }}>{c.name}</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Discover */}
        {suggested.length > 0 && (
          <section>
            <div className="section-header">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>📈 Discover</h3>
              <Link to="/communities" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>Browse all →</Link>
            </div>
            <div className="grid-auto">
              {suggested.map((c, i) => (
                <Link key={c.communityID} to={`/community/${c.communityID}`} className="card" style={{ textDecoration: "none", display: "block", animationDelay: `${i * 0.05}s` }}>
                  <span className="badge" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", fontSize: "0.7rem" }}>{c.niche || "General"}</span>
                  <h4 style={{ fontWeight: 600, margin: "8px 0 4px", fontSize: "0.95rem" }}>{c.name}</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>👥 {c.memberCount} members</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {joined.length === 0 && suggested.length === 0 && !loading && (
          <div className="empty-state">
            <div style={{ fontSize: "3rem", marginBottom: "14px", opacity: 0.2 }}>👥</div>
            <p style={{ fontWeight: 500, fontSize: "1rem", marginBottom: "8px" }}>No communities yet</p>
            <Link to="/communities" className="btn btn-primary" style={{ marginTop: "12px" }}>Browse Communities</Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}