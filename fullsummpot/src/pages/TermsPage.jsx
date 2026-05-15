import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    id: "terms",
    title: "Terms of Service",
    icon: "📜",
    content: [
      { heading: "1. Acceptance of Terms", text: "By accessing or using Full Summpot, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you may not use our platform." },
      { heading: "2. User Accounts", text: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration. You must not create multiple accounts for deceptive purposes." },
      { heading: "3. Community Guidelines", text: "Users must respect other community members. Harassment, spam, hate speech, and illegal content are strictly prohibited. Community administrators have the right to moderate content within their communities." },
      { heading: "4. Content Ownership", text: "You retain ownership of content you post. By submitting content, you grant Full Summpot a non-exclusive, worldwide license to display, distribute, and promote your content on the platform." },
      { heading: "5. Link Sharing & Support", text: "Links shared must be legitimate and not contain malware, phishing, or illegal content. The support verification system tracks genuine engagement. Artificial inflation of clicks or support metrics is prohibited." },
      { heading: "6. Account Termination", text: "We reserve the right to suspend or terminate accounts that violate these terms. Users may delete their accounts at any time through the account settings page." },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    icon: "🔒",
    content: [
      { heading: "1. Data Collection", text: "We collect information you provide directly (username, email, profile information). We also collect usage data such as pages visited, links clicked, and community interactions to improve the platform experience." },
      { heading: "2. Data Usage", text: "Your data is used to provide and improve our services, personalize your experience, communicate updates, and ensure platform security. We never sell your personal data to third parties." },
      { heading: "3. Data Storage & Security", text: "All data is stored securely with industry-standard encryption. Passwords are hashed using BCrypt. We implement HTTPS encryption for all data transmission." },
      { heading: "4. Cookies", text: "We use JWT tokens stored in localStorage for authentication. No third-party tracking cookies are used on this platform." },
      { heading: "5. Your Rights", text: "You have the right to access, modify, or delete your personal data at any time through your profile and account settings. You may request a complete data export by contacting support." },
    ],
  },
  {
    id: "guidelines",
    title: "Community Guidelines",
    icon: "🤝",
    content: [
      { heading: "1. Be Respectful", text: "Treat all community members with respect. Constructive criticism is welcome; personal attacks are not. Foster an environment where creators feel safe to share and grow." },
      { heading: "2. Authentic Engagement", text: "Only verify support for content you have genuinely engaged with. Fake clicks, bot activity, and engagement farming are strictly prohibited and will result in account suspension." },
      { heading: "3. Quality Content", text: "Share links to genuine, original content. Spam, clickbait, and misleading titles are not allowed. Community administrators may remove content that violates community-specific rules." },
      { heading: "4. No Self-Promotion Abuse", text: "While the platform encourages cross-promotion, excessive or irrelevant self-promotion outside designated areas is discouraged. Respect each community's rules regarding promotion." },
      { heading: "5. Report Violations", text: "If you encounter content or behavior that violates these guidelines, please report it through the platform. We review all reports and take appropriate action." },
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="hero-section" style={{ marginBottom: "32px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <img src="/logo.png" alt="Logo" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} className="logo-glow" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            Legal & Guidelines
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
            Everything you need to know about using Full Summpot
          </p>
        </div>

        {/* Quick Nav */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="btn btn-secondary btn-sm" style={{ gap: "6px" }}>
              {s.icon} {s.title}
            </a>
          ))}
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.id} id={section.id} style={{ marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, margin: "0 0 20px", display: "flex", alignItems: "center", gap: "10px" }}>
              {section.icon} {section.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {section.content.map((item, i) => (
                <div key={i} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text-primary)" }}>{item.heading}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Copyright */}
        <div className="card" style={{ textAlign: "center", marginTop: "48px", background: "var(--accent-subtle)", borderColor: "rgba(220,38,38,0.1)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 8px" }}>
            © {new Date().getFullYear()} Full Summpot — All Rights Reserved
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>
            Full Summpot is a registered trademark. All content, design, and intellectual property on this platform are protected under applicable copyright and trademark laws. Unauthorized reproduction or distribution is prohibited.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
