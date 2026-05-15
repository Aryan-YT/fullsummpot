import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUserData();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [createdComm, setCreatedComm] = useState([]);
  const [joinedComm, setJoinedComm] = useState([]);
  const [links, setLinks] = useState([]);
  const [points, setPoints] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const isOwn = currentUser && parseInt(currentUser.UserID) === parseInt(id);

  useEffect(() => { fetchAll(); }, [id]); // eslint-disable-line

  const fetchAll = async () => {
    await Promise.all([fetchProfile(), fetchPosts(), fetchComm(), fetchFollow(), fetchLinks(), fetchPoints()]);
  };

  const fetchProfile = async () => { try { const d = (await API.get(`/Auth/profile/${id}`)).data; setUser(d); setUsername(d.username); setBio(d.bio || ""); } catch {} };
  const fetchPosts = async () => { try { const d = (await API.get("/Posts")).data; setPosts(d.filter(p => p.userID === parseInt(id))); } catch {} };
  const fetchComm = async () => { try { const d = (await API.get("/Communities")).data; setCreatedComm(d.filter(c => c.ownerID === parseInt(id))); const j = (await API.get(`/Communities/joined/${id}`)).data; setJoinedComm(j); } catch {} };
  const fetchFollow = async () => {
    try { const r = (await API.get(`/Auth/followers/${id}`)).data; setFollowers(r); setFollowersCount(r.length); } catch {}
    try { const r = (await API.get(`/Auth/following/${id}`)).data; setFollowing(r); setFollowingCount(r.length); } catch {}
    if (currentUser) { try { const r = (await API.get(`/Auth/isfollowing?followerID=${currentUser.UserID}&followingID=${id}`)).data; setIsFollowing(r.isFollowing); } catch {} }
  };
  const fetchLinks = async () => { try { setLinks((await API.get(`/Links/user/${id}`)).data); } catch {} };
  const fetchPoints = async () => { try { setPoints((await API.get(`/Links/points/${id}`)).data); } catch {} };

  const followUser = async () => { if (!currentUser) { navigate("/login"); return; } try { const r = (await API.post("/Auth/follow", { followerID: parseInt(currentUser.UserID), followingID: parseInt(id) })).data; setIsFollowing(r.following); fetchFollow(); } catch {} };
  const updateProfile = async () => { try { const fd = new FormData(); fd.append("username", username); fd.append("bio", bio); fd.append("userID", currentUser.UserID); if (profileImage) fd.append("profileImage", profileImage); await API.put(`/Auth/profile/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }); fetchProfile(); } catch {} };
  const clickLink = async (linkID, url) => { if (!currentUser) { navigate("/login"); return; } try { await API.post("/Links/click", { linkID, clickedByUserID: parseInt(currentUser.UserID) }); window.open(url, "_blank"); } catch {} };

  const stats = [
    { label: "Posts", value: posts.length, icon: "📝" },
    { label: "Created", value: createdComm.length, icon: "🏗️" },
    { label: "Joined", value: joinedComm.length, icon: "👥" },
    { label: "Followers", value: followersCount, icon: "❤️", onClick: () => setShowFollowers(!showFollowers) },
    { label: "Following", value: followingCount, icon: "➡️", onClick: () => setShowFollowing(!showFollowing) },
    { label: "Points", value: points?.availablePoints ?? 0, icon: "⭐" },
  ];

  const UserList = ({ title, list, show }) => show && (
    <div className="card animate-slide-up" style={{ marginBottom: "16px" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", margin: "0 0 12px" }}>{title}</h3>
      {list.length === 0 ? <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>None yet</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {list.map(f => (
            <div key={f.userID} onClick={() => navigate(`/profile/${f.userID}`)} style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "var(--accent-hover)" }}>{f.username?.charAt(0).toUpperCase()}</div>
              <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{f.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: "900px" }}>
        {/* Profile Card */}
        <div className="hero-section" style={{ marginBottom: "24px", padding: "28px" }}>
          <div className="orb" style={{ width: "200px", height: "200px", background: "rgba(220,38,38,0.04)", top: "-50px", right: "-30px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--accent)" }} className="avatar-glow" />
              ) : (
                <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "var(--accent-subtle)", border: "2px solid rgba(220,38,38,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", fontWeight: 800, color: "var(--accent-hover)" }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              {isOwn ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} style={{ fontSize: "1.15rem", fontWeight: 700 }} />
                  <textarea className="input-field" placeholder="Write your bio…" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} style={{ resize: "none" }} />
                  <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }} />
                  <button onClick={updateProfile} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Save Profile</button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{user?.username}</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 4px" }}>{user?.email}</p>
                  {user?.bio && <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 12px", lineHeight: 1.5 }}>{user.bio}</p>}
                  {currentUser && <button onClick={followUser} className={`btn ${isFollowing ? "btn-outline" : "btn-primary"}`}>{isFollowing ? "Unfollow" : "Follow"}</button>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "24px" }}>
          {stats.map(s => (
            <div key={s.label} className="card stat-card" onClick={s.onClick} style={{ textAlign: "center", cursor: s.onClick ? "pointer" : "default", padding: "14px 10px" }}>
              <div style={{ fontSize: "1rem", marginBottom: "4px" }}>{s.icon}</div>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 1px", letterSpacing: "-0.02em" }}>{s.value}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <UserList title="Followers" list={followers} show={showFollowers} />
        <UserList title="Following" list={following} show={showFollowing} />

        {/* Links */}
        {links.length > 0 && (
          <section style={{ marginBottom: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 12px" }}>🔗 Support Links</h3>
            <div className="grid-auto">
              {links.map(l => (
                <div key={l.linkID} className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, fontSize: "0.88rem", margin: "0 0 3px" }}>{l.title}</h4>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>🖱️ {l.clickCount} clicks</p>
                  </div>
                  <button onClick={() => clickLink(l.linkID, l.url)} className="btn btn-outline btn-sm">Support ↗</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Communities */}
        {createdComm.length > 0 && (
          <section style={{ marginBottom: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 12px" }}>🏗️ Created</h3>
            <div className="grid-auto">
              {createdComm.map(c => (
                <Link key={c.communityID} to={`/community/${c.communityID}`} className="card" style={{ display: "block" }}>
                  {c.bannerUrl && <div style={{ width: "100%", height: "80px", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: "10px" }}><img src={c.bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                  <h4 style={{ fontWeight: 600, margin: "0 0 4px", fontSize: "0.92rem" }}>{c.name}</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
        {joinedComm.length > 0 && (
          <section>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 12px" }}>👥 Joined</h3>
            <div className="grid-auto">
              {joinedComm.map(c => (
                <Link key={c.communityID} to={`/community/${c.communityID}`} className="card" style={{ display: "block" }}>
                  <h4 style={{ fontWeight: 600, margin: "0 0 4px", fontSize: "0.92rem" }}>{c.name}</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}