import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/Auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", overflow: "hidden" }}>
      {/* Background Orbs */}
      <div className="orb" style={{ width: "500px", height: "500px", background: "rgba(220,38,38,0.06)", top: "-150px", right: "-100px" }} />
      <div className="orb" style={{ width: "400px", height: "400px", background: "rgba(220,38,38,0.04)", bottom: "-100px", left: "-100px" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }} className="animate-scale-in">
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div className="animate-float" style={{ marginBottom: "16px" }}>
            <img src="/logo.png" alt="Full Summpot" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto" }} className="logo-glow animate-pulse-glow" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
            <span style={{ color: "var(--accent)" }}>Full</span>
            <span> Summpot</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
            Creator growth through community power
          </p>
        </div>

        {/* Card with 3D effect */}
        <div className="card card-3d" style={{ padding: "28px", borderRadius: "var(--radius-xl)" }}>
          <div className="card-3d-inner">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 24px" }}>Welcome back</h2>

            {error && (
              <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: "16px", color: "var(--accent-hover)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "8px" }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={loginUser} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>

              <div>
                <label className="label">Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} className="input-field" style={{ paddingRight: "44px" }} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", padding: "4px" }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "4px" }}>
                {loading && <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />}
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: "var(--accent-hover)", fontWeight: 600, transition: "color 0.2s" }}>Create one</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link to="/terms" style={{ color: "var(--text-muted)", fontSize: "0.75rem", transition: "color 0.2s" }}>Terms of Service</Link>
          <span style={{ color: "var(--text-muted)", margin: "0 8px", fontSize: "0.75rem" }}>·</span>
          <Link to="/terms#privacy" style={{ color: "var(--text-muted)", fontSize: "0.75rem", transition: "color 0.2s" }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}