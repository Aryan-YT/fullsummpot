import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

const niches = ["Gaming", "Tech", "Education", "Music", "Comedy", "Vlogging", "Finance", "Fitness", "Food", "Travel", "Other"];

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const user = getUserData();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [banner, setBanner] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchCommunities(); }, []); // eslint-disable-line

  const fetchCommunities = async () => {
    try {
      const url = user ? `/Communities?userID=${user.UserID}` : "/Communities";
      setCommunities((await API.get(url)).data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const joinCommunity = async (communityID) => {
    if (!user) { navigate("/login"); return; }
    setJoining(communityID);
    try {
      await API.post("/Communities/join", { userID: parseInt(user.UserID), communityID });
      fetchCommunities();
    } catch (e) { console.log(e); }
    finally { setJoining(null); }
  };

  const createCommunity = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("name", name); fd.append("description", description); fd.append("ownerID", parseInt(user.UserID)); fd.append("niche", niche);
      if (banner) fd.append("banner", banner);
      await API.post("/Communities", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setName(""); setDescription(""); setNiche(""); setBanner(null); setShowCreate(false);
      fetchCommunities();
    } catch (e) { console.log(e); }
    finally { setCreating(false); }
  };


  const filtered = communities.filter(
    (c) => (c.name?.toLowerCase().includes(search.toLowerCase()) || c.niche?.toLowerCase().includes(search.toLowerCase())) &&
           (!selectedNiche || c.niche === selectedNiche)
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px" }}>👥 Communities</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>Find your niche and grow together</p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">➕ Create Community</button>
          )}
        </div>

        {/* Search & Niche Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.88rem" }}>🔍</span>
            <input className="input-field" style={{ paddingLeft: "38px" }} placeholder="Search communities…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field" style={{ width: "auto", minWidth: "140px" }} value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)}>
            <option value="">All Niches</option>
            {niches.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--text-secondary)" }}>Loading communities…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>👥</div>
            <p>No communities found</p>
          </div>
        ) : (
          <div className="grid-auto">
            {filtered.map((c, i) => (
              <div
                key={c.communityID}
                className="card card-3d"
                style={{ display: "flex", flexDirection: "column", animationDelay: `${i * 0.03}s`, cursor: "pointer" }}
                onClick={() => navigate(`/community/${c.communityID}`)}
              >
                <div className="card-3d-inner" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {c.bannerUrl && (
                    <div style={{ width: "100%", height: "90px", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: "12px", flexShrink: 0 }}>
                      <img src={c.bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span className="badge badge-accent">{c.niche || "General"}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>👥 {c.memberCount}</span>
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: "1rem", margin: "0 0 6px" }}>{c.name}</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 14px", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "auto" }} onClick={(e) => e.stopPropagation()}>
                    <Link to={`/community/${c.communityID}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>View</Link>
                    {c.isMember ? (
                      <span className="btn btn-sm" style={{ flex: 1, background: "rgba(34,197,94,0.08)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.15)", justifyContent: "center" }}>✓ Joined</span>
                    ) : (
                      <button onClick={() => joinCommunity(c.communityID)} disabled={joining === c.communityID} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        {joining === c.communityID ? "…" : "Join"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "440px", padding: "28px" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>Create Community</h3>
                <button onClick={() => setShowCreate(false)} className="btn-ghost" style={{ fontSize: "1.2rem", padding: "4px 8px" }}>✕</button>
              </div>
              <form onSubmit={createCommunity} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label className="label">Community Name</label>
                  <input className="input-field" placeholder="Gaming Legends" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input-field" style={{ resize: "none" }} rows={3} placeholder="What is this community about?" value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} />
                </div>
                <div>
                  <label className="label">Niche</label>
                  <select className="input-field" value={niche} onChange={(e) => setNiche(e.target.value)} required>
                    <option value="">Select niche…</option>
                    {niches.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Banner Image (optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }} />
                </div>
                <button type="submit" disabled={creating} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "4px" }}>
                  {creating ? "Creating…" : "Create Community →"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
