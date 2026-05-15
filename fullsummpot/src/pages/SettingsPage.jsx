import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { getUserData } from "../utils/auth";

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = getUserData();

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchProfile();
  }, []); // eslint-disable-line

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/Auth/profile/${user.UserID}`);
      setProfile(res.data);
      setUsername(res.data.username);
      setBio(res.data.bio || "");
    } catch (e) { console.log(e); }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("userID", user.UserID);
      if (profileImage) formData.append("profileImage", profileImage);

      await API.put(`/Auth/profile/${user.UserID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      fetchProfile();
    } catch (e) {
      setProfileMsg({ type: "error", text: "Failed to update profile." });
    } finally { setSavingProfile(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords don't match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await API.put("/Auth/change-password", {
        userID: parseInt(user.UserID),
        currentPassword,
        newPassword,
      });
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPasswordMsg({ type: "error", text: e.response?.data?.message || "Failed to change password." });
    } finally { setSavingPassword(false); }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action is irreversible.")) return;
    if (!window.confirm("This will permanently delete all your data including links, posts, and community memberships. Proceed?")) return;
    try {
      await API.delete(`/Auth/profile/${user.UserID}`);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (e) { console.log(e); }
  };

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "👤 Profile", icon: "👤" },
    { id: "security", label: "🔒 Security", icon: "🔒" },
    { id: "danger", label: "⚠️ Danger Zone", icon: "⚠️" },
  ];

  const Msg = ({ msg }) => {
    if (!msg) return null;
    return (
      <div style={{
        background: msg.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(220,38,38,0.08)",
        border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(220,38,38,0.15)"}`,
        borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: "16px",
        color: msg.type === "success" ? "var(--success)" : "var(--accent-hover)", fontSize: "0.82rem",
      }}>
        {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: "700px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px" }}>⚙️ Account Settings</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 24px" }}>Manage your profile, security, and account preferences</p>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: "24px" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-btn ${activeTab === t.id ? "active" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="card animate-slide-up" style={{ padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 20px" }}>Edit Profile</h3>
            <Msg msg={profileMsg} />

            <form onSubmit={updateProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Avatar Preview */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
                {profile?.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="Profile" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent)" }} />
                ) : (
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--accent-subtle)", border: "2px solid rgba(220,38,38,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-hover)" }}>
                    {username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: 600, margin: "0 0 2px" }}>{profile?.username}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>{profile?.email}</p>
                </div>
              </div>

              <div>
                <label className="label">Username</label>
                <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input-field" rows={3} style={{ resize: "none" }} placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <label className="label">Profile Picture</label>
                <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }} />
              </div>
              <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                {savingProfile ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="card animate-slide-up" style={{ padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 20px" }}>Change Password</h3>
            <Msg msg={passwordMsg} />

            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input-field" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input-field" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" className="input-field" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" disabled={savingPassword} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                {savingPassword ? "Changing…" : "Change Password"}
              </button>
            </form>

            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
              <h4 style={{ fontWeight: 600, fontSize: "0.9rem", margin: "0 0 8px" }}>Account Information</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: "0 0 4px" }}>
                Email: <span style={{ color: "var(--text-primary)" }}>{profile?.email || "—"}</span>
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: 0 }}>
                Role: <span className="badge badge-info" style={{ marginLeft: "4px" }}>{profile?.role || "User"}</span>
              </p>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === "danger" && (
          <div className="card animate-slide-up" style={{ padding: "28px", borderColor: "rgba(220,38,38,0.15)", background: "rgba(220,38,38,0.02)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px", color: "var(--accent-hover)" }}>⚠️ Danger Zone</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 20px", lineHeight: 1.6 }}>
              Actions here are irreversible. Please proceed with caution.
            </p>

            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid rgba(220,38,38,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: "0 0 4px" }}>Delete Account</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0 }}>
                    Permanently remove your account and all associated data.
                  </p>
                </div>
                <button onClick={deleteAccount} className="btn btn-sm" style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-hover)", border: "1px solid rgba(220,38,38,0.2)" }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
