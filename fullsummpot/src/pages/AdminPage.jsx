import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function timeAgo(d) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return "now"; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; }

export default function AdminPage() {
  const navigate = useNavigate();
  const user = getUserData();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const adminID = user ? parseInt(user.UserID || user.userid || user.nameid || user.id || 0) : 0;

  const fetchAll = async () => {

    setLoading(true);

    try {

      const [s, u, c, p, l] =
        await Promise.all([

          API.get(`/Admin/stats?adminID=${adminID}`),

          API.get(`/Admin/users?adminID=${adminID}`),

          API.get(`/Admin/communities?adminID=${adminID}`),

          API.get(`/Admin/posts?adminID=${adminID}`),

          API.get(`/Admin/links?adminID=${adminID}`),

        ]);

      setStats(s.data);

      setUsers(u.data);

      setCommunities(c.data);

      setPosts(p.data);

      setLinks(l.data);

    } catch (e) {

      if (e.response?.status === 401) {

        alert("Admin access required");

        navigate("/");

      }

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "Admin") { alert("Admin access required"); navigate("/"); return; }
    fetchAll();
  }, []);

  const deleteUser = async (id) => { if (!window.confirm("Delete this user and all their data?")) return; try { await API.delete(`/Admin/users/${id}?adminID=${adminID}`); fetchAll(); } catch { } };
  const changeRole = async (id, role) => { try { await API.put(`/Admin/users/${id}/role?adminID=${adminID}`, { role }); fetchAll(); } catch { } };
  const deleteCommunity = async (id) => { if (!window.confirm("Delete this community and all its content?")) return; try { await API.delete(`/Admin/communities/${id}?adminID=${adminID}`); fetchAll(); } catch { } };
  const deletePost = async (id) => { if (!window.confirm("Delete this post?")) return; try { await API.delete(`/Admin/posts/${id}?adminID=${adminID}`); fetchAll(); } catch { } };
  const deleteLink = async (id) => { if (!window.confirm("Delete this link?")) return; try { await API.delete(`/Admin/links/${id}?adminID=${adminID}`); fetchAll(); } catch { } };

  if (!user || user.role !== "Admin") return null;

  const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredCommunities = communities.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredPosts = posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.username?.toLowerCase().includes(search.toLowerCase()));
  const filteredLinks = links.filter(l => l.title?.toLowerCase().includes(search.toLowerCase()) || l.username?.toLowerCase().includes(search.toLowerCase()));

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "users", label: `👥 Users (${users.length})` },
    { id: "communities", label: `🏘️ Communities (${communities.length})` },
    { id: "posts", label: `📝 Posts (${posts.length})` },
    { id: "links", label: `🔗 Links (${links.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px" }}>🛡️ Admin Panel</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>Manage platform content and users</p>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: "20px", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); }} className={`tab-btn ${tab === t.id ? "active" : ""}`}>{t.label}</button>
          ))}
        </div>

        {/* Search (not on overview) */}
        {tab !== "overview" && (
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.88rem" }}>🔍</span>
            <input className="input-field" style={{ paddingLeft: "38px" }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : (
          <>
            {/* Overview */}
            {tab === "overview" && stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
                {[
                  { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" },
                  { label: "Communities", value: stats.totalCommunities, icon: "🏘️", color: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)" },
                  { label: "Posts", value: stats.totalPosts, icon: "📝", color: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" },
                  { label: "Links", value: stats.totalLinks, icon: "🔗", color: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
                  { label: "Total Clicks", value: stats.totalClicks, icon: "🖱️", color: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)" },
                ].map(s => (
                  <div key={s.label} className="card stat-card" style={{ textAlign: "center", background: s.color, borderColor: s.border }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{s.icon}</div>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Role</th><th>Stats</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.userID}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate(`/profile/${u.userID}`)}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "var(--accent-hover)", overflow: "hidden", flexShrink: 0 }}>
                              {u.profileImageUrl ? <img src={u.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.username?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.username}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === "Admin" ? "badge-accent" : ""}`} style={u.role !== "Admin" ? { background: "rgba(148,163,184,0.08)", color: "var(--text-secondary)", border: "1px solid rgba(148,163,184,0.15)" } : {}}>
                            {u.role || "User"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{u.postsCount}p · {u.linksCount}l · {u.communitiesOwned}c</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {u.role !== "Admin" ? (
                              <button onClick={() => changeRole(u.userID, "Admin")} className="btn btn-sm" style={{ padding: "3px 8px", fontSize: "0.7rem", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>Make Admin</button>
                            ) : (
                              <button onClick={() => changeRole(u.userID, "User")} className="btn btn-sm" style={{ padding: "3px 8px", fontSize: "0.7rem" }}>Demote</button>
                            )}
                            {u.userID !== parseInt(user.UserID) && (
                              <button onClick={() => deleteUser(u.userID)} className="btn btn-sm" style={{ padding: "3px 8px", fontSize: "0.7rem", background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Communities */}
            {tab === "communities" && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Community</th><th>Owner</th><th>Members</th><th>Posts</th><th>Links</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredCommunities.map(c => (
                      <tr key={c.communityID}>
                        <td>
                          <div style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => navigate(`/community/${c.communityID}`)}>
                            {c.name}
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 400 }}>{c.niche || "General"}</div>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>@{c.ownerName}</td>
                        <td style={{ fontFamily: "monospace" }}>{c.memberCount}</td>
                        <td style={{ fontFamily: "monospace" }}>{c.postCount}</td>
                        <td style={{ fontFamily: "monospace" }}>{c.linkCount}</td>
                        <td>
                          <button onClick={() => deleteCommunity(c.communityID)} className="btn btn-sm" style={{ padding: "3px 8px", fontSize: "0.7rem", background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Posts */}
            {tab === "posts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredPosts.map(p => (
                  <div key={p.postID} className="card" style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", padding: "16px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 600, fontSize: "0.92rem", margin: "0 0 3px" }}>{p.title}</h4>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.content}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>
                        @{p.username} · {p.communityName} · ❤️ {p.likesCount} · 💬 {p.commentsCount} · {p.createdAt ? timeAgo(p.createdAt) : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => navigate(`/community/${p.communityID}`)} className="btn btn-outline btn-sm" style={{ padding: "3px 10px", fontSize: "0.7rem" }}>View</button>
                      <button onClick={() => deletePost(p.postID)} className="btn btn-sm" style={{ padding: "3px 8px", fontSize: "0.7rem", background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️</button>
                    </div>
                  </div>
                ))}
                {filteredPosts.length === 0 && <div className="empty-state"><p>No posts found.</p></div>}
              </div>
            )}

            {/* Links */}
            {tab === "links" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredLinks.map(l => (
                  <div key={l.linkID} className="card" style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", padding: "16px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 600, fontSize: "0.92rem", margin: "0 0 3px" }}>{l.title}</h4>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
                        @{l.username} · {l.communityName} · 🖱️ {l.clickCount} clicks · {l.createdAt ? timeAgo(l.createdAt) : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ padding: "3px 10px", fontSize: "0.7rem" }}>Open ↗</a>
                      <button onClick={() => deleteLink(l.linkID)} className="btn btn-sm" style={{ padding: "3px 8px", fontSize: "0.7rem", background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️</button>
                    </div>
                  </div>
                ))}
                {filteredLinks.length === 0 && <div className="empty-state"><p>No links found.</p></div>}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
