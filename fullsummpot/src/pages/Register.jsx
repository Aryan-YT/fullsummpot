import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("Please agree to the Terms of Service."); return; }
    setLoading(true);
    setError("");
    try {
      await API.post("/Auth/register", { username, email, passwordHash: password, role: "User" });
      const loginRes = await API.post("/Auth/login", { email, password });
      localStorage.setItem("token", loginRes.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", overflow: "hidden" }}>
      <div className="orb" style={{ width: "500px", height: "500px", background: "rgba(220,38,38,0.06)", top: "-150px", left: "-100px" }} />
      <div className="orb" style={{ width: "300px", height: "300px", background: "rgba(59,130,246,0.04)", bottom: "-80px", right: "-80px" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }} className="animate-scale-in">
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div className="animate-float" style={{ marginBottom: "16px" }}>
            <img src="/logo.png" alt="Full Summpot" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto" }} className="logo-glow animate-pulse-glow" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
            Join <span style={{ color: "var(--accent)" }}>Full Summpot</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>Start growing your channel today</p>
        </div>

        <div className="card card-3d" style={{ padding: "28px", borderRadius: "var(--radius-xl)" }}>
          <div className="card-3d-inner">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 24px" }}>Create your account</h2>

            {error && (
              <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: "16px", color: "var(--accent-hover)", fontSize: "0.82rem" }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={registerUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="label">Username</label>
                <input className="input-field" placeholder="coolcreator" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
              </div>
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} className="input-field" style={{ paddingRight: "44px" }} placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* TOS checkbox */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: "3px", accentColor: "var(--accent)" }} />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" style={{ color: "var(--accent-hover)", fontWeight: 500 }}>Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/terms#privacy" target="_blank" style={{ color: "var(--accent-hover)", fontWeight: 500 }}>Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" disabled={loading || !agreed} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "4px" }}>
                {loading ? "Creating account…" : "Create Account →"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "24px" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--accent-hover)", fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}