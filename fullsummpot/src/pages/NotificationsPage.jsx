import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserData } from "../utils/auth";

function timeAgo(d) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return "now"; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; }

export default function NotificationsPage() {
  const navigate = useNavigate();
  const user = getUserData();
  const [supporters, setSupporters] = useState([]);
  const [myClicks, setMyClicks] = useState([]);
  const [tab, setTab] = useState("received");
  const [loading, setLoading] = useState(true);

  const markAllRead = useCallback(() => { localStorage.setItem("notifLastSeen", Date.now().toString()); window.dispatchEvent(new Event("notifRead")); }, []);
  const fetchSupporters = useCallback(async () => { if (!user) return; try { const r = await fetch(`http://localhost:5242/api/Links/supporters/${user.UserID}`); if (r.ok) setSupporters(await r.json()); } catch {} }, [user]);
  const fetchMyClicks = useCallback(async () => { if (!user) return; try { const r = await fetch(`http://localhost:5242/api/Links/myclicks/${user.UserID}`); if (r.ok) setMyClicks(await r.json()); } catch {} }, [user]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    Promise.all([fetchSupporters(), fetchMyClicks()]).finally(() => { setLoading(false); markAllRead(); });
  }, [user, fetchSupporters, fetchMyClicks, markAllRead, navigate]);

  const myClickedUserIDs = new Set(myClicks.map(c => c.supporterUserID));
  const pendingBack = supporters.filter(s => s.userID && !myClickedUserIDs.has(s.userID));

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: "800px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px" }}>🔔 Notifications</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>Track support received and given</p>
        </div>

        <div className="tab-bar" style={{ marginBottom: "24px" }}>
          {[
            { id: "received", label: "❤️ Received", count: supporters.length },
            { id: "pending", label: "🔄 Support Back", count: pendingBack.length },
            { id: "given", label: "✅ Given", count: myClicks.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? "active" : ""}`}>
              {t.label}
              {t.count > 0 && <span style={{ background: tab === t.id ? "rgba(255,255,255,0.2)" : "var(--accent)", color: "#fff", borderRadius: "9999px", padding: "1px 7px", fontSize: "0.68rem", fontWeight: 700 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}><div className="spinner" style={{ margin: "0 auto 16px" }} /><p style={{ color: "var(--text-secondary)" }}>Loading…</p></div>
        ) : (
          <>
            {tab === "received" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {supporters.length === 0 ? <div className="empty-state"><div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>📭</div><p>No supporters yet.</p></div> : supporters.map((s, i) => (
                  <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", padding: "16px" }}>
                    <div onClick={() => s.userID && navigate(`/profile/${s.userID}`)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-subtle)", border: "1px solid rgba(220,38,38,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--accent-hover)", flexShrink: 0 }}>{s.username?.charAt(0).toUpperCase() || "?"}</div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.88rem", margin: "0 0 2px" }}>{s.username || "A creator"}</p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Supported <span style={{ color: "var(--accent-hover)", fontWeight: 600 }}>{s.title || "your link"}</span></p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                      <span className="badge badge-success">✓ Verified</span>
                      {s.userID && <button onClick={() => navigate(`/profile/${s.userID}`)} className="btn btn-primary btn-sm">Support Back</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "pending" && (
              <div>
                {pendingBack.length === 0 ? (
                  <div className="empty-state"><div style={{ fontSize: "2rem", marginBottom: "12px" }}>🎉</div><p style={{ color: "var(--success)", fontWeight: 600 }}>All caught up!</p></div>
                ) : (
                  <>
                    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.1rem" }}>⚡</span>
                      <p style={{ color: "var(--warning)", fontSize: "0.85rem", margin: 0 }}><strong>{pendingBack.length} creator{pendingBack.length > 1 ? "s" : ""}</strong> supported you — return the favor!</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {pendingBack.map((s, i) => (
                        <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "14px", borderColor: "rgba(245,158,11,0.12)", padding: "16px", flexWrap: "wrap" }}>
                          <div onClick={() => navigate(`/profile/${s.userID}`)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(245,158,11,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--warning)", flexShrink: 0 }}>{s.username?.charAt(0).toUpperCase()}</div>
                            <div><p style={{ fontWeight: 700, fontSize: "0.88rem", margin: "0 0 2px" }}>{s.username}</p><p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0 }}>Supported <span style={{ color: "var(--warning)" }}>{s.title}</span></p></div>
                          </div>
                          <button onClick={() => navigate(`/profile/${s.userID}`)} className="btn btn-secondary btn-sm">Visit & Support →</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "given" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myClicks.length === 0 ? <div className="empty-state"><div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>🤝</div><p>Haven't supported anyone yet.</p></div> : myClicks.map((c, i) => (
                  <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-sm)", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>▶</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem", margin: "0 0 2px" }}>{c.title || "Support Link"}</p>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", margin: 0 }}>Supported <span style={{ color: "var(--accent-hover)" }}>@{c.supporterUsername}</span>{c.createdAt && <span style={{ color: "var(--text-muted)" }}> · {timeAgo(c.createdAt)}</span>}</p>
                    </div>
                    <span className="badge badge-success">✓</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
