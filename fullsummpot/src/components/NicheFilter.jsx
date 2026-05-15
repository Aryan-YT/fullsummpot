const NICHES = [
  { id: "all",         label: "All",          emoji: "✦" },
  { id: "music",       label: "Music",         emoji: "🎵" },
  { id: "art",         label: "Art",           emoji: "🎨" },
  { id: "writing",     label: "Writing",       emoji: "✍️" },
  { id: "gaming",      label: "Gaming",        emoji: "🎮" },
  { id: "podcasts",    label: "Podcasts",      emoji: "🎙" },
  { id: "film",        label: "Film",          emoji: "🎬" },
  { id: "design",      label: "Design",        emoji: "🖌" },
  { id: "code",        label: "Code",          emoji: "💻" },
  { id: "photography", label: "Photography",   emoji: "📷" },
];

export { NICHES };

export default function NicheFilter({ activeNiche, onChange }) {
  return (
    <div className="chips-row animate-fade-in" style={{ marginBottom: "0" }}>
      {NICHES.map((n) => (
        <button
          key={n.id}
          className={`niche-chip${activeNiche === n.id ? " active" : ""}`}
          onClick={() => onChange(n.id)}
        >
          <span>{n.emoji}</span>
          <span>{n.label}</span>
        </button>
      ))}
    </div>
  );
}
