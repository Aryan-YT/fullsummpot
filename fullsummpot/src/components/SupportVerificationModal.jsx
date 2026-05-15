import { useState, useEffect, useRef } from "react";

const PLATFORM_ICONS = {
  youtube:   { icon: "▶", color: "#FF0000", name: "YouTube" },
  youtu:     { icon: "▶", color: "#FF0000", name: "YouTube" },
  twitter:   { icon: "𝕏", color: "#1DA1F2", name: "Twitter / X" },
  "x.com":   { icon: "𝕏", color: "#1DA1F2", name: "Twitter / X" },
  instagram: { icon: "📸", color: "#E1306C", name: "Instagram" },
  tiktok:    { icon: "♪", color: "#69C9D0", name: "TikTok" },
  twitch:    { icon: "🎮", color: "#9146FF", name: "Twitch" },
  spotify:   { icon: "♫", color: "#1DB954", name: "Spotify" },
  soundcloud:{ icon: "☁", color: "#FF5500", name: "SoundCloud" },
  patreon:   { icon: "P", color: "#F96854", name: "Patreon" },
  discord:   { icon: "💬", color: "#5865F2", name: "Discord" },
  reddit:    { icon: "🔴", color: "#FF4500", name: "Reddit" },
};

function detectPlatform(url = "") {
  const lower = url.toLowerCase();
  for (const [key, val] of Object.entries(PLATFORM_ICONS)) {
    if (lower.includes(key)) return val;
  }
  return { icon: "🔗", color: "#7C3AED", name: "Website" };
}

const VERIFY_SECONDS = 10;

export default function SupportVerificationModal({ link, onClose, onVerified }) {
  const [phase, setPhase] = useState("intro");   // intro | waiting | ready | done
  const [countdown, setCountdown] = useState(VERIFY_SECONDS);
  const timerRef = useRef(null);
  const platform = detectPlatform(link?.url);

  // Cleanup
  useEffect(() => () => clearInterval(timerRef.current), []);

  // Escape to close (only before done)
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && phase !== "waiting") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [phase, onClose]);

  const handleOpenLink = () => {
    window.open(link.url, "_blank");
    setPhase("waiting");
    setCountdown(VERIFY_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setPhase("ready");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleConfirm = async () => {
    setPhase("done");
    await onVerified();
  };

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.82)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    zIndex: 2000,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
    animation: "fadeIn 0.25s ease",
  };

  const modalStyle = {
    width: "100%", maxWidth: "460px",
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "32px",
    animation: "scaleIn 0.3s cubic-bezier(.16,1,.3,1)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
    position: "relative",
  };

  // Arc progress (SVG circle)
  const r = 30, circ = 2 * Math.PI * r;
  const progress = phase === "waiting" ? ((VERIFY_SECONDS - countdown) / VERIFY_SECONDS) * circ : circ;

  return (
    <div style={overlayStyle} onClick={phase !== "waiting" ? onClose : undefined}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Close (not during waiting) */}
        {phase !== "waiting" && phase !== "done" && (
          <button onClick={onClose} style={{ position:"absolute", top:"16px", right:"16px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"#71717a", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", lineHeight:0, transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,0.1)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="#71717a"; e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}

        {/* ── INTRO PHASE ── */}
        {phase === "intro" && (
          <div style={{ textAlign:"center" }}>
            {/* Platform icon */}
            <div style={{ width:"72px", height:"72px", borderRadius:"18px", background:`${platform.color}20`, border:`2px solid ${platform.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", margin:"0 auto 20px", fontWeight:"900" }}>
              {platform.icon}
            </div>
            <span style={{ display:"inline-block", padding:"3px 12px", borderRadius:"9999px", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", color:"#a78bfa", fontSize:"0.72rem", fontWeight:"600", fontFamily:"Inter,sans-serif", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"14px" }}>
              Support Verification
            </span>
            <h2 style={{ fontFamily:"Montserrat,sans-serif", fontWeight:"800", fontSize:"1.35rem", color:"#fff", margin:"0 0 8px", letterSpacing:"-0.02em" }}>
              {link?.title}
            </h2>
            <p style={{ color:"#71717a", fontFamily:"Inter,sans-serif", fontSize:"0.875rem", lineHeight:1.6, margin:"0 0 6px" }}>
              on <span style={{ color: platform.color, fontWeight:"600" }}>{platform.name}</span>
            </p>
            <p style={{ color:"#52525b", fontFamily:"Inter,sans-serif", fontSize:"0.8rem", margin:"0 0 28px", wordBreak:"break-all" }}>{link?.url}</p>

            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", padding:"16px 18px", marginBottom:"24px", textAlign:"left" }}>
              <p style={{ color:"#a1a1aa", fontFamily:"Inter,sans-serif", fontSize:"0.85rem", margin:0, lineHeight:1.6 }}>
                <strong style={{ color:"#fff" }}>How it works:</strong><br/>
                1. Click <em>Open Link</em> — it opens in a new tab<br/>
                2. Visit the page and support the creator<br/>
                3. A <strong style={{ color:"#a78bfa" }}>{VERIFY_SECONDS}s timer</strong> will run to confirm your visit<br/>
                4. Come back and click <em>I've Done It</em> to get verified ✅
              </p>
            </div>

            <button onClick={handleOpenLink}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"none", background:"#7C3AED", color:"#fff", fontSize:"1rem", fontWeight:"700", fontFamily:"Inter,sans-serif", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#6D28D9"; e.currentTarget.style.boxShadow="0 0 24px rgba(124,58,237,0.4)"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#7C3AED"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateY(0)"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open Link
            </button>
          </div>
        )}

        {/* ── WAITING PHASE ── */}
        {phase === "waiting" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ marginBottom:"24px" }}>
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                <circle cx="40" cy="40" r={r} fill="none" stroke="#7C3AED" strokeWidth="6"
                  strokeDasharray={circ} strokeDashoffset={circ - progress}
                  strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s linear" }}/>
                <text x="40" y="40" dominantBaseline="central" textAnchor="middle" fill="#fff"
                  fontSize="18" fontWeight="800" fontFamily="Montserrat,sans-serif"
                  style={{ transform:"rotate(90deg)", transformOrigin:"40px 40px" }}>
                  {countdown}
                </text>
              </svg>
            </div>
            <h2 style={{ fontFamily:"Montserrat,sans-serif", fontWeight:"800", fontSize:"1.25rem", color:"#fff", margin:"0 0 10px" }}>
              Verifying your visit…
            </h2>
            <p style={{ color:"#71717a", fontFamily:"Inter,sans-serif", fontSize:"0.875rem", lineHeight:1.6, margin:"0 0 8px" }}>
              The link is open in another tab.
            </p>
            <p style={{ color:"#52525b", fontFamily:"Inter,sans-serif", fontSize:"0.82rem" }}>
              Complete the support action, then return here when the timer finishes.
            </p>

            {/* Animated dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginTop:"24px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#7C3AED", animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
              ))}
            </div>
          </div>
        )}

        {/* ── READY PHASE ── */}
        {phase === "ready" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(16,185,129,0.12)", border:"2px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ display:"inline-block", padding:"3px 12px", borderRadius:"9999px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#34d399", fontSize:"0.72rem", fontWeight:"600", fontFamily:"Inter,sans-serif", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"14px" }}>
              Timer Complete
            </span>
            <h2 style={{ fontFamily:"Montserrat,sans-serif", fontWeight:"800", fontSize:"1.3rem", color:"#fff", margin:"0 0 10px" }}>
              Did you support the creator?
            </h2>
            <p style={{ color:"#71717a", fontFamily:"Inter,sans-serif", fontSize:"0.875rem", margin:"0 0 28px", lineHeight:1.6 }}>
              Confirm below to record your verified support. Only confirm if you genuinely completed the action (subscribe, like, follow, etc.)
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <button onClick={handleConfirm}
                style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"none", background:"#10B981", color:"#fff", fontSize:"0.95rem", fontWeight:"700", fontFamily:"Inter,sans-serif", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="#059669"; e.currentTarget.style.boxShadow="0 0 20px rgba(16,185,129,0.35)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="#10B981"; e.currentTarget.style.boxShadow="none"; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Yes, I've Done It — Record My Support
              </button>
              <button onClick={onClose}
                style={{ width:"100%", padding:"12px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#52525b", fontSize:"0.875rem", fontWeight:"500", fontFamily:"Inter,sans-serif", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#a1a1aa"; e.currentTarget.style.borderColor="rgba(255,255,255,0.16)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="#52525b"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}>
                I haven't done it yet
              </button>
            </div>
          </div>
        )}

        {/* ── DONE PHASE ── */}
        {phase === "done" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:"80px", height:"80px", borderRadius:"50%", background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(16,185,129,0.2))", border:"2px solid rgba(124,58,237,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", animation:"scaleIn 0.4s cubic-bezier(.16,1,.3,1)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ display:"inline-block", padding:"3px 12px", borderRadius:"9999px", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa", fontSize:"0.72rem", fontWeight:"600", fontFamily:"Inter,sans-serif", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"14px" }}>
              Verified ✓
            </span>
            <h2 style={{ fontFamily:"Montserrat,sans-serif", fontWeight:"800", fontSize:"1.4rem", color:"#fff", margin:"0 0 10px" }}>
              Support Recorded! ❤️
            </h2>
            <p style={{ color:"#71717a", fontFamily:"Inter,sans-serif", fontSize:"0.875rem", margin:"0 0 28px", lineHeight:1.6 }}>
              Your support has been verified and recorded. The creator will see you in their <strong style={{ color:"#a78bfa" }}>Supporters</strong> panel.
            </p>
            <button onClick={onClose}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"none", background:"#7C3AED", color:"#fff", fontSize:"0.95rem", fontWeight:"700", fontFamily:"Inter,sans-serif", cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#6D28D9"; e.currentTarget.style.boxShadow="0 0 20px rgba(124,58,237,0.4)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#7C3AED"; e.currentTarget.style.boxShadow="none"; }}>
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
