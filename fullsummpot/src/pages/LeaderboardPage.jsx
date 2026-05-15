import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

const medalIcons = ["🥇", "🥈", "🥉"];
const podiumColors = ["rgba(251,191,36,0.12)", "rgba(148,163,184,0.08)", "rgba(217,119,6,0.08)"];
const podiumBorders = ["rgba(251,191,36,0.25)", "rgba(148,163,184,0.15)", "rgba(217,119,6,0.15)"];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try { setLeaderboard((await API.get("/Links/leaderboard")).data); }
    catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 0", gap: "16px" }}>
          <div className="spinner" style={{ width: "40px", height: "40px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Calculating rankings…</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.length >= 3
    ? [leaderboard[1], leaderboard[0], leaderboard[2]]
    : leaderboard.slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px" }}>🏆 Leaderboard</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>Top creators ranked by community impact</p>
        </div>

        {/* 3D Podium */}
        {topThree.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", maxWidth: "560px", margin: "0 auto 40px", paddingTop: "28px", perspective: "800px" }} className="animate-slide-up">
            {topThree.map((entry, i) => {
              if (!entry) return <div key={i} />;
              const isWinner = entry.rank === 1;
              const heights = ["100px", "130px", "85px"];
              return (
                <div key={entry.userID} onClick={() => navigate(`/profile/${entry.userID}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: isWinner ? "-28px" : "0", cursor: "pointer", transition: "transform 0.3s" }}>
                  <div style={{
                    width: isWinner ? "72px" : "56px", height: isWinner ? "72px" : "56px",
                    borderRadius: "50%", background: "var(--bg-elevated)",
                    border: `2px solid ${podiumBorders[entry.rank - 1]}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "8px", overflow: "hidden",
                    boxShadow: isWinner ? "0 0 24px rgba(251,191,36,0.2)" : "none",
                    transition: "all 0.3s",
                  }}>
                    {entry.profileImageUrl ? (
                      <img src={entry.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: isWinner ? "1.4rem" : "1rem", fontWeight: 800 }}>{entry.username?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", margin: "0 0 2px" }}>{entry.username}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: "0 0 10px" }}>{entry.points?.toLocaleString()} pts</p>
                  <div style={{
                    width: "100%", borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                    background: podiumColors[entry.rank - 1],
                    borderTop: `1px solid ${podiumBorders[entry.rank - 1]}`,
                    borderLeft: `1px solid ${podiumBorders[entry.rank - 1]}`,
                    borderRight: `1px solid ${podiumBorders[entry.rank - 1]}`,
                    height: heights[i],
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                  }}>
                    <span style={{ fontSize: "1.5rem" }}>{medalIcons[entry.rank - 1]}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-secondary)" }}>#{entry.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Creator</th>
                <th style={{ textAlign: "right" }}>Points</th>
                <th style={{ textAlign: "right" }}>Links</th>
                <th style={{ textAlign: "right" }}>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.rank} onClick={() => navigate(`/profile/${row.userID}`)}>
                  <td>
                    {row.rank <= 3 ? <span style={{ fontSize: "1.1rem" }}>{medalIcons[row.rank - 1]}</span> : <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>#{row.rank}</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-subtle)", border: "1px solid rgba(220,38,38,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-hover)", overflow: "hidden", flexShrink: 0 }}>
                        {row.profileImageUrl ? <img src={row.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : row.username?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{row.username}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>⭐ {row.points?.toLocaleString()}</td>
                  <td style={{ textAlign: "right", color: "var(--text-secondary)", fontFamily: "monospace" }}>{row.linksSubmitted}</td>
                  <td style={{ textAlign: "right", color: "var(--text-secondary)", fontFamily: "monospace" }}>{row.clicksReceived}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaderboard.length === 0 && (
          <div className="empty-state" style={{ marginTop: "24px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>🏆</div>
            <p>No data yet. Start supporting creators!</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
