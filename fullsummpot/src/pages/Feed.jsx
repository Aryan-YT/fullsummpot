import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function timeAgo(d) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return "now"; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; }

export default function Feed() {
  const navigate = useNavigate();
  const user = getUserData();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchPosts();
  }, []); // eslint-disable-line

  const fetchPosts = async () => {
    try { setPosts((await API.get("/Posts")).data); }
    catch (error) { console.log(error); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: "700px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px" }}>📰 Feed</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>Latest posts across all communities</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>📰</div>
            <p style={{ fontWeight: 500 }}>No posts yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {posts.map((post) => (
              <div key={post.postID} className="card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", cursor: "pointer" }} onClick={() => navigate(`/profile/${post.userID}`)}>
                  {post.profileImageUrl ? (
                    <img src={post.profileImageUrl} alt="" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} />
                  ) : (
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>{post.username?.charAt(0)}</div>
                  )}
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{post.username}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginLeft: "8px" }}>{post.createdAt ? timeAgo(post.createdAt) : ""}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px" }}>{post.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 12px", wordBreak: "break-word", lineHeight: 1.6 }}>{post.content}</p>

                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" style={{ width: "100%", borderRadius: "var(--radius-md)", marginBottom: "12px" }} />
                )}

                {post.communityID && (
                  <button onClick={() => navigate(`/community/${post.communityID}`)} className="btn btn-outline btn-sm" style={{ marginTop: "4px" }}>
                    View Community →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}