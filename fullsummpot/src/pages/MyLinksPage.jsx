import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function extractVideoId(url) { return url?.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1] ?? null; }
function timeAgo(d) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return "now"; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; }

export default function MyLinksPage() {
  const navigate = useNavigate();
  const user = getUserData();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingID, setEditingID] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchLinks();
  }, []); // eslint-disable-line

  const fetchLinks = async () => {
    try { setLinks((await API.get(`/Links/user/${user.UserID}`)).data); }
    catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const deleteLink = async (id) => {
    if (!window.confirm("Delete this link?")) return;
    try { await API.delete(`/Links/${id}`); fetchLinks(); } catch (e) { console.log(e); }
  };

  const startEdit = (link) => { setEditingID(link.linkID); setEditTitle(link.title); setEditUrl(link.url); };
  const saveEdit = async () => {
    try { await API.put(`/Links/${editingID}`, { title: editTitle, url: editUrl }); setEditingID(null); fetchLinks(); } catch (e) { console.log(e); }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px" }}>🔗 My Links</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>All links you've submitted across communities</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : links.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>🔗</div>
            <p style={{ fontWeight: 500 }}>No links submitted yet.</p>
            <p style={{ fontSize: "0.82rem", marginTop: "4px" }}>Join a community and start sharing!</p>
          </div>
        ) : (
          <div className="grid-auto">
            {links.map((link, i) => {
              const videoId = extractVideoId(link.url);
              const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
              const isEditing = editingID === link.linkID;
              return (
                <div key={link.linkID} className="card" style={{ display: "flex", flexDirection: "column", animationDelay: `${i * 0.03}s` }}>
                  {thumb && (
                    <div style={{ width: "100%", height: "140px", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: "12px", background: "var(--bg-elevated)", position: "relative" }}>
                      <img src={thumb} alt={link.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 60%, rgba(0,0,0,0.6))" }} />
                    </div>
                  )}
                  {isEditing ? (
                    <>
                      <input className="input-field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ marginBottom: "8px", fontSize: "0.88rem" }} />
                      <input className="input-field" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} style={{ marginBottom: "8px", fontSize: "0.82rem" }} />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={saveEdit} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Save</button>
                        <button onClick={() => setEditingID(null)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontWeight: 600, fontSize: "0.92rem", margin: "0 0 4px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", flex: 1 }}>{link.title}</h3>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 12px" }}>{timeAgo(link.createdAt)} ago</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>🖱️ {link.clickCount} clicks</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ padding: "5px 10px", fontSize: "0.72rem" }}>Open ↗</a>
                          <button onClick={() => startEdit(link)} className="btn btn-secondary btn-sm" style={{ padding: "5px 10px", fontSize: "0.72rem" }}>✏️</button>
                          <button onClick={() => deleteLink(link.linkID)} className="btn btn-sm" style={{ padding: "5px 10px", fontSize: "0.72rem", background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
