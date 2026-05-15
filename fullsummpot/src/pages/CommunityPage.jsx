import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

function extractVideoId(url) { return url?.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1] ?? null; }
function timeAgo(d) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return "now"; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; }
function renderWithLinks(t) { const r = /(https?:\/\/[^\s]+)/g; return t.split(r).map((p, i) => p.match(r) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{ color: "var(--info)", textDecoration: "underline", wordBreak: "break-all" }}>{p}</a> : p); }

const niches = ["Gaming", "Tech", "Education", "Music", "Comedy", "Vlogging", "Finance", "Fitness", "Food", "Travel", "Other"];

const getUserId = (u) => u ? parseInt(u.UserID || u.userid || u.nameid || u.id || 0) : 0;

export default function CommunityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUserData();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [links, setLinks] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [tab, setTab] = useState("links");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [showSubmitLink, setShowSubmitLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [submittingLink, setSubmittingLink] = useState(false);
  const [editingPostID, setEditingPostID] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Edit community state
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editNiche, setEditNiche] = useState("");
  const [editBanner, setEditBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const isOwner = user && community && getUserId(user) === community.ownerID;

  useEffect(() => { setLoading(true); Promise.all([fetchCommunity(), fetchPosts(), fetchLinks()]).then(() => setLoading(false)); }, [id]); // eslint-disable-line

  const fetchCommunity = async () => { try { setCommunity((await API.get(user ? `/Communities/${id}?userID=${getUserId(user)}` : `/Communities/${id}`)).data); } catch {} };
  const fetchPosts = async () => { try { const d = (await API.get(`/Posts/community/${id}`)).data; setPosts(d); d.forEach(p => { fetchLikes(p.postID); fetchComments(p.postID); }); } catch {} };
  const fetchLinks = async () => { try { setLinks((await API.get(user ? `/Links/community/${id}?userID=${getUserId(user)}` : `/Links/community/${id}`)).data); } catch {} };
  const fetchLikes = async (pid) => { try { const res = await API.get(`/Posts/${pid}/likes`); setLikes(p => ({ ...p, [pid]: res.data.count })); } catch {} };
  const fetchComments = async (pid) => { try { const res = await API.get(`/Posts/${pid}/comments`); setComments(p => ({ ...p, [pid]: res.data })); } catch {} };

  const likePost = async (pid) => { if (!user) { navigate("/login"); return; } try { await API.post("/Posts/like", { userID: getUserId(user), postID: pid }); fetchLikes(pid); } catch {} };
  const addComment = async (pid) => { if (!user) { navigate("/login"); return; } try { await API.post("/Posts/comment", { content: commentInputs[pid], userID: getUserId(user), postID: pid }); setCommentInputs(p => ({ ...p, [pid]: "" })); fetchComments(pid); } catch {} };
  const createPost = async () => { if (!user) return; try { const fd = new FormData(); fd.append("title", title); fd.append("content", content); fd.append("userID", getUserId(user)); fd.append("communityID", parseInt(id)); if (image) fd.append("image", image); await API.post("/Posts", fd, { headers: { "Content-Type": "multipart/form-data" } }); setTitle(""); setContent(""); setImage(null); fetchPosts(); } catch { alert("Only community owner can post"); } };
  const deletePost = async (pid) => { if (!window.confirm("Delete this post?")) return; try { await API.delete(`/Posts/${pid}`); fetchPosts(); } catch {} };
  const savePostEdit = async (pid) => { try { await API.put(`/Posts/${pid}`, { title: editTitle, content: editContent }); setEditingPostID(null); fetchPosts(); } catch {} };

  const submitLink = async (e) => { e.preventDefault(); if (!user) { navigate("/login"); return; } setSubmittingLink(true); try { await API.post("/Links", { userID: getUserId(user), communityID: parseInt(id), title: linkTitle, url: linkUrl }); setLinkUrl(""); setLinkTitle(""); setShowSubmitLink(false); fetchLinks(); } catch {} finally { setSubmittingLink(false); } };
  const clickLink = async (linkID, url) => { if (!user) { navigate("/login"); return; } try { await API.post("/Links/click", { linkID, clickedByUserID: getUserId(user) }); fetchLinks(); window.open(url, "_blank"); } catch {} };
  const deleteLink = async (linkID) => { if (!window.confirm("Delete this link?")) return; try { await API.delete(`/Links/${linkID}`); fetchLinks(); } catch {} };

  const joinCommunity = async () => { if (!user) { navigate("/login"); return; } try { await API.post("/Communities/join", { userID: getUserId(user), communityID: parseInt(id) }); fetchCommunity(); } catch {} };
  const leaveCommunity = async () => { try { await API.post("/Communities/leave", { userID: getUserId(user), communityID: parseInt(id) }); fetchCommunity(); } catch (e) { alert(e?.response?.data?.message || "Error"); } };

  const openEditCommunity = () => { setEditName(community.name); setEditDesc(community.description); setEditNiche(community.niche || ""); setEditBanner(null); setShowEditCommunity(true); };
  const saveCommunityEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData(); fd.append("name", editName); fd.append("description", editDesc); fd.append("niche", editNiche);
      if (editBanner) fd.append("banner", editBanner);
      await API.put(`/Communities/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setShowEditCommunity(false); fetchCommunity();
    } catch {} finally { setSaving(false); }
  };
  const deleteCommunity = async () => {
    if (!window.confirm("Are you sure? This will permanently delete this community, all its posts, and links.")) return;
    try { await API.delete(`/Communities/${id}`); navigate("/communities"); } catch {}
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}><Navbar /><div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><div className="spinner" /></div></div>;
  if (!community) return <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}><Navbar /><div className="page-container"><div className="empty-state"><p>Community not found.</p></div></div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: "1000px" }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: "12px", padding: "4px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>← Back</button>

        {/* Header Card */}
        <div className="hero-section" style={{ marginBottom: "24px", padding: "28px" }}>
          <div className="orb" style={{ width: "250px", height: "250px", background: "rgba(220,38,38,0.04)", top: "-60px", right: "-40px" }} />
          {community.bannerUrl && (
            <div style={{ width: "100%", height: "180px", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "16px" }}>
              <img src={community.bannerUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", position: "relative", zIndex: 1 }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: "8px", display: "inline-block" }}>{community.niche || "General"}</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, margin: "8px 0 4px", letterSpacing: "-0.02em" }}>{community.name}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 8px" }}>{community.description}</p>
              <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>👥 {community.memberCount} members</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
              {community.isMember ? (
                <>
                  <button onClick={() => setShowSubmitLink(true)} className="btn btn-primary">➕ Submit Link</button>
                  {isOwner ? (
                    <>
                      <button onClick={openEditCommunity} className="btn btn-secondary btn-sm">✏️ Edit</button>
                      <button onClick={deleteCommunity} className="btn btn-sm" style={{ background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️ Delete</button>
                    </>
                  ) : (
                    <button onClick={leaveCommunity} className="btn btn-outline btn-sm">Leave</button>
                  )}
                </>
              ) : (
                <button onClick={joinCommunity} className="btn btn-primary btn-lg">Join Community</button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: "24px" }}>
          <button onClick={() => setTab("links")} className={`tab-btn ${tab === "links" ? "active" : ""}`}>🔗 Links</button>
          <button onClick={() => setTab("posts")} className={`tab-btn ${tab === "posts" ? "active" : ""}`}>📝 Posts</button>
        </div>

        {/* Links Tab */}
        {tab === "links" && (
          <div>
            {links.length === 0 ? (
              <div className="empty-state"><div style={{ fontSize: "2rem", marginBottom: "12px", opacity: 0.2 }}>🔗</div><p>No links yet. {community.isMember ? "Be the first!" : "Join to submit."}</p></div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
                {links.map((link) => {
                  const thumb = extractVideoId(link.url) ? `https://img.youtube.com/vi/${extractVideoId(link.url)}/mqdefault.jpg` : null;
                  const canDelete = user && (getUserId(user) === link.userID || isOwner);
                  return (
                    <div key={link.linkID} className="card" style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: "14px" }}>
                        <button onClick={() => clickLink(link.linkID, link.url)} style={{ flexShrink: 0, width: "112px", height: "64px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--bg-elevated)", border: "none", cursor: "pointer", padding: 0 }}>
                          {thumb && <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontWeight: 500, fontSize: "0.88rem", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.title}</h4>
                          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 3px" }}>@{link.username} · {timeAgo(link.createdAt)}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            <button onClick={() => clickLink(link.linkID, link.url)} className="btn btn-sm" style={{
                              padding: "3px 10px", fontSize: "0.72rem",
                              background: link.isClickedByMe ? "rgba(34,197,94,0.06)" : "transparent",
                              border: `1px solid ${link.isClickedByMe ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
                              color: link.isClickedByMe ? "var(--success)" : "var(--text-secondary)",
                            }}>
                              🖱️ {link.clickCount} {link.isClickedByMe ? "✓" : "clicks"}
                            </button>
                            {canDelete && (
                              <button onClick={() => deleteLink(link.linkID)} className="btn btn-sm" style={{ padding: "3px 8px", fontSize: "0.72rem", background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {tab === "posts" && (
          <div>
            {isOwner && (
              <div className="card" style={{ marginBottom: "20px", padding: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", margin: "0 0 16px" }}>Create Post</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input className="input-field" placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea className="input-field" placeholder="Share something…" value={content} onChange={(e) => setContent(e.target.value)} rows={3} style={{ resize: "none" }} />
                  <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }} />
                  <button onClick={createPost} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Post</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {posts.map((post) => (
                <div key={post.postID} className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", cursor: "pointer" }} onClick={() => navigate(`/profile/${post.userID}`)}>
                    {post.profileImageUrl ? <img src={post.profileImageUrl} alt="" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} /> : <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>{post.username?.charAt(0)}</div>}
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{post.username}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginLeft: "8px" }}>{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  {editingPostID === post.postID ? (
                    <>
                      <input className="input-field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ marginBottom: "8px" }} />
                      <textarea className="input-field" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} style={{ resize: "none", marginBottom: "12px" }} />
                      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <button onClick={() => savePostEdit(post.postID)} className="btn btn-primary btn-sm">Save</button>
                        <button onClick={() => setEditingPostID(null)} className="btn btn-outline btn-sm">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px" }}>{post.title}</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 12px", wordBreak: "break-word", lineHeight: 1.6 }}>{renderWithLinks(post.content)}</p>
                    </>
                  )}
                  {post.imageUrl && <img src={post.imageUrl} alt="" style={{ width: "100%", borderRadius: "var(--radius-md)", marginBottom: "12px" }} />}

                  {isOwner && editingPostID !== post.postID && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <button onClick={() => { setEditingPostID(post.postID); setEditTitle(post.title); setEditContent(post.content); }} className="btn btn-secondary btn-sm">✏️ Edit</button>
                      <button onClick={() => deletePost(post.postID)} className="btn btn-sm" style={{ background: "rgba(220,38,38,0.06)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.15)" }}>🗑️ Delete</button>
                    </div>
                  )}

                  <button onClick={() => likePost(post.postID)} className="btn btn-sm" style={{ background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)", color: "#fb7185", marginBottom: "12px" }}>
                    ❤️ {likes[post.postID] || 0} Likes
                  </button>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input className="input-field" placeholder="Write a comment…" value={commentInputs[post.postID] || ""} onChange={(e) => setCommentInputs(p => ({ ...p, [post.postID]: e.target.value }))} style={{ flex: 1 }} />
                    <button onClick={() => addComment(post.postID)} className="btn btn-primary btn-sm">Comment</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {(comments[post.postID] || []).map((c) => (
                      <div key={c.commentID} style={{ background: "var(--bg-elevated)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.84rem", margin: 0 }}>{renderWithLinks(c.content)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {posts.length === 0 && <div className="empty-state"><p>No posts yet.</p></div>}
            </div>
          </div>
        )}

        {/* Submit Link Modal */}
        {showSubmitLink && (
          <div className="modal-overlay" onClick={() => setShowSubmitLink(false)}>
            <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "440px", padding: "28px" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", margin: 0 }}>Submit a Link</h3>
                <button onClick={() => setShowSubmitLink(false)} className="btn-ghost" style={{ fontSize: "1.2rem", padding: "4px 8px" }}>✕</button>
              </div>
              <form onSubmit={submitLink} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div><label className="label">YouTube URL</label><input className="input-field" placeholder="https://youtube.com/watch?v=…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required /></div>
                <div><label className="label">Title</label><input className="input-field" placeholder="My awesome video" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} required minLength={3} /></div>
                <button type="submit" disabled={submittingLink} className="btn btn-primary btn-lg" style={{ width: "100%" }}>{submittingLink ? "Submitting…" : "Submit Link →"}</button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Community Modal */}
        {showEditCommunity && (
          <div className="modal-overlay" onClick={() => setShowEditCommunity(false)}>
            <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "440px", padding: "28px" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", margin: 0 }}>Edit Community</h3>
                <button onClick={() => setShowEditCommunity(false)} className="btn-ghost" style={{ fontSize: "1.2rem", padding: "4px 8px" }}>✕</button>
              </div>
              <form onSubmit={saveCommunityEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div><label className="label">Name</label><input className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} required minLength={3} /></div>
                <div><label className="label">Description</label><textarea className="input-field" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} style={{ resize: "none" }} required minLength={10} /></div>
                <div><label className="label">Niche</label>
                  <select className="input-field" value={editNiche} onChange={(e) => setEditNiche(e.target.value)}>
                    <option value="">General</option>
                    {niches.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div><label className="label">Banner Image (optional)</label><input type="file" accept="image/*" onChange={(e) => setEditBanner(e.target.files[0])} style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }} /></div>
                <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ width: "100%" }}>{saving ? "Saving…" : "Save Changes →"}</button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}