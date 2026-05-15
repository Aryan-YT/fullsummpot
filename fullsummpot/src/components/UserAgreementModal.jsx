import { useState, useEffect } from "react";

const TERMS = `
1. ACCEPTANCE OF TERMS
By creating an account on FullSummpot, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.

2. RECIPROCAL SUPPORT OBLIGATION
FullSummpot is built on genuine creator-to-creator support. When another creator supports your content, you are expected to return support in good faith. Abuse of the support system — such as clicking links without genuinely engaging, or farming clicks without reciprocating — may result in account suspension.

3. CONTENT POLICY
You may only post content you own or have rights to. You must not post content that is harmful, illegal, harassing, or violates any third-party rights. FullSummpot reserves the right to remove content at any time.

4. VERIFIED SUPPORT
The verification system (10-second timer gate) exists to protect creators from fake click inflation. Attempting to bypass the verification timer through automation, scripts, or other means is strictly prohibited.

5. PRIVACY & DATA
We collect your username, email, and activity data (communities joined, links clicked, posts) to operate the platform. Your data is never sold to third parties. You can request deletion of your account at any time by contacting support.

6. INTELLECTUAL PROPERTY
Your content remains yours. By posting on FullSummpot, you grant us a limited license to display your content within the platform.

7. COMMUNITY CONDUCT
You agree to treat all creators with respect. Harassment, hate speech, spam, or any behavior that damages the community experience is prohibited and may result in permanent removal.

8. CHANGES TO TERMS
We may update these terms periodically. Continued use of FullSummpot after changes constitutes acceptance of the updated terms.

9. LIMITATION OF LIABILITY
FullSummpot is provided "as is" without warranties of any kind. We are not responsible for any damages arising from your use of the platform.

10. CONTACT
For any questions about these terms, please reach out through the platform's community channels.
`;

export default function UserAgreementModal({ onAccept }) {
  const [termsChecked, setTermsChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const canAccept = termsChecked && ageChecked;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>
      {/* Modal — flex column so footer is ALWAYS visible, never pushed off screen */}
      <div style={{
        width: "100%", maxWidth: "540px",
        maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 40px 100px rgba(0,0,0,0.9)",
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "transform 0.4s cubic-bezier(.16,1,.3,1)",
      }}>

        {/* Header — fixed, never scrolls */}
        <div style={{
          background: "linear-gradient(135deg, #1a0a2e 0%, #0d0d0d 100%)",
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "12px",
          flexShrink: 0,
        }}>
          <img src="/logo.png" alt="FullSummpot" style={{ height: "40px", width: "40px", objectFit: "contain", borderRadius: "9px" }} />
          <div>
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "900", fontSize: "1.05rem", color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
              Before You Join FullSummpot
            </h2>
            <p style={{ color: "#71717a", fontFamily: "Inter, sans-serif", fontSize: "0.75rem", margin: "3px 0 0" }}>
              Please read and accept our Terms of Service
            </p>
          </div>
        </div>

        {/* Scrollable terms — takes up remaining space */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 24px",
          scrollbarWidth: "thin",
          scrollbarColor: "#3f3f46 transparent",
          minHeight: 0,
        }}>
          <div style={{ paddingTop: "16px", paddingBottom: "16px" }}>
            {TERMS.trim().split("\n\n").map((section, i) => {
              const lines = section.split("\n");
              const heading = lines[0];
              const body = lines.slice(1).join(" ");
              return (
                <div key={i} style={{ marginBottom: "14px" }}>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "700", fontSize: "0.72rem", color: "#a78bfa", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {heading}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: checkboxes + CTA — always pinned to bottom, never scrolls away */}
        <div style={{
          padding: "16px 24px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "#0d0d0d",
          flexShrink: 0,
        }}>
          {/* Checkbox 1 */}
          <div
            onClick={() => setTermsChecked(!termsChecked)}
            style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px", cursor: "pointer" }}
          >
            <div style={{
              width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0, marginTop: "2px",
              border: termsChecked ? "none" : "2px solid rgba(255,255,255,0.2)",
              background: termsChecked ? "#7C3AED" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {termsChecked && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "#a1a1aa", lineHeight: 1.45, userSelect: "none" }}>
              I have read and agree to the{" "}
              <span style={{ color: "#a78bfa", fontWeight: "600" }}>Terms of Service</span>
              , including the reciprocal support obligations and content policy.
            </span>
          </div>

          {/* Checkbox 2 */}
          <div
            onClick={() => setAgeChecked(!ageChecked)}
            style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px", cursor: "pointer" }}
          >
            <div style={{
              width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0, marginTop: "2px",
              border: ageChecked ? "none" : "2px solid rgba(255,255,255,0.2)",
              background: ageChecked ? "#7C3AED" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {ageChecked && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "#a1a1aa", lineHeight: 1.45, userSelect: "none" }}>
              I confirm that I am at least{" "}
              <span style={{ color: "#a78bfa", fontWeight: "600" }}>13 years of age</span>
              {" "}and understand that FullSummpot is a creator support community.
            </span>
          </div>

          {/* Accept button */}
          <button
            onClick={() => {
              if (canAccept) {
                localStorage.setItem("agreedToTerms", "1");
                onAccept();
              }
            }}
            disabled={!canAccept}
            style={{
              width: "100%", padding: "13px",
              borderRadius: "11px", border: "none",
              background: canAccept ? "#7C3AED" : "rgba(255,255,255,0.06)",
              color: canAccept ? "#fff" : "#52525b",
              fontSize: "0.9rem", fontWeight: "700",
              fontFamily: "Inter, sans-serif",
              cursor: canAccept ? "pointer" : "not-allowed",
              transition: "all 0.25s",
              boxShadow: canAccept ? "0 0 20px rgba(124,58,237,0.35)" : "none",
            }}
            onMouseEnter={e => {
              if (canAccept) {
                e.currentTarget.style.background = "#6D28D9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={e => {
              if (canAccept) {
                e.currentTarget.style.background = "#7C3AED";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {canAccept ? "Accept & Continue →" : "Please accept both checkboxes to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
